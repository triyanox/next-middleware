import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import {
  AuthRules,
  BaseOptions,
  ExtractParams,
  MiddlewareOptions,
  ParamsObject,
  Path,
  RuleFunction,
  Routes,
  RedirectOptions,
} from './types';

/**
 * This module provides a clean way to protect your Next.js routes using the Next.js middleware pattern.
 * It allows you to protect your Next.js routes in a typesafe way with an easy-to-use API.
 *
 * @example
 * // Define the type of the data you want to perform the checks on
 * type Data = User
 *
 * // Import the necessary dependencies
 * import Middleware, { RuleFunction } from "@triyanox/next-middleware";
 * import { routes } from "./lib/link$";
 *
 * // Define your route protection rules
 * const isLoggedIn: RuleFunction<Data, typeof routes> = ({ data, next, redirect, path }) => {...};
 * const isNotLoggedIn: RuleFunction<Data, typeof routes> = async ({ data, next, redirect }) => {...};
 * const isAdmin: RuleFunction<Data, typeof routes> = ({ data, next, redirect, path }) => {...};
 *
 * // Construct the middleware and perform the checks
 * const middleware = new Middleware<typeof routes, Data>({...});
 *
 * // Export the middleware from your `middleware.ts` file in your next.js project
 * export default middleware.handle.bind(middleware);
 * export const config = {...};
 *
 * @see {@link https://github.com/triyanox/next-middleware|GitHub}
 */ class Middleware<
  R extends Record<
    string,
    {
      path: string;
    }
  >,
  T = any,
> {
  private fetch: (req: NextRequest) => Promise<T | undefined>;
  private rules: AuthRules<T, R, keyof R & string>;
  private authPaths: Array<keyof R & string>;
  private onError?: (req: NextRequest) => Promise<NextResponse> | NextResponse;

  constructor(options: MiddlewareOptions<R, T>) {
    this.fetch = options.fetch;
    this.rules = options.rules;
    this.authPaths = options.authPaths;
    this.onError = options.onError;
  }

  private extractParams<R extends string>(
    path: R,
    pathname: string,
  ): ParamsObject<R> {
    const pathParts = path.split('/');
    const pathnameParts = pathname.split('/');

    return pathParts.reduce((params, part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const key = part.slice(1, -1) as ExtractParams<R>[number];
        return {
          ...params,
          [key]: pathnameParts[index],
        };
      }
      return params;
    }, {} as ParamsObject<R>);
  }

  private isWildcard<R extends string>(path: R): boolean {
    return path.endsWith('/*');
  }

  private match<R extends string>(path: R, pathname: string): boolean {
    const pathParts = path.split('/');
    const pathnameParts = pathname.split('/');
    return pathParts.every((part, index) => {
      if (part === '*') {
        return true;
      }
      if (part.startsWith('[') && part.endsWith(']')) {
        return true;
      }
      return part === pathnameParts[index];
    });
  }

  private sortPaths(paths: Array<keyof R & string>): Array<keyof R & string> {
    return paths.sort((a, b) => {
      if (this.isWildcard(a) && !this.isWildcard(b)) {
        return 1;
      }
      return -1;
    });
  }

  private async apply(req: NextRequest, pathname: string, data: T) {
    const allPaths = Object.keys(this.rules);
    const matchedPaths = allPaths.filter((path) => this.match(path, pathname));
    const sortedPaths = this.sortPaths(matchedPaths);

    for (const path of sortedPaths) {
      const rules = this.rules[path] || [];
      const params = this.extractParams(path, pathname);

      let nextCalled = false;
      let redirectPath: (keyof R & string) | undefined;

      const next = async () => {
        nextCalled = true;
        return undefined;
      };
      const redirect = (
        path: keyof R & string,
        options?: RedirectOptions<keyof R & string>,
      ) => {
        redirectPath = path;
        if (options) {
          if ('params' in options) {
            const params = options.params;
            const pathParts = path.split('/');
            const newPathParts = pathParts.map((part) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                const key = part.slice(1, -1);
                return params[key as keyof typeof params];
              }
              return part;
            });
            const newPath = newPathParts.join('/');
            redirectPath = newPath;
          }
          if (options.query) {
            const searchParams = new URLSearchParams(options.query);
            redirectPath += `?${searchParams.toString()}`;
          }
          if (options.hash) {
            redirectPath += `#${options.hash}`;
          }
        }
      };

      for (const rule of rules) {
        await rule({
          data,
          params,
          next,
          redirect,
          path: new URL(req.url).pathname,
        });
        if (redirectPath) {
          break;
        }
        if (nextCalled) {
          continue;
        }
      }

      if (!nextCalled && !redirectPath) {
        return NextResponse.next();
      }
      if (redirectPath && redirectPath !== new URL(req.url).pathname) {
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }

      return NextResponse.next();
    }
  }

  /**
   * The default handler for the middleware
   */
  async handle(req: NextRequest, ev: NextFetchEvent) {
    const pathname = new URL(req.url).pathname;
    if (
      this.authPaths.some((path) => {
        const pathParts = path.split('/');
        const pathnameParts = pathname.split('/');
        return pathParts.every((part, index) => {
          if (part === '*') {
            return true;
          }
          if (part.startsWith('[') && part.endsWith(']')) {
            return true;
          }
          return part === pathnameParts[index];
        });
      })
    ) {
      try {
        const data = await this.fetch(req);
        if (!data) {
          throw 'Missing data from `fetch`';
        }
        return await this.apply(req, pathname, data);
      } catch (e) {
        if (this.onError) {
          return await this.onError(req);
        }
      }
    } else {
      return NextResponse.next();
    }
  }
}

export default Middleware;
export { Middleware };
export type {
  AuthRules,
  BaseOptions,
  ExtractParams,
  MiddlewareOptions,
  ParamsObject,
  Path,
  RuleFunction,
  Routes,
};
