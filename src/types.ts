import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';

type Path<R extends string> = R | (R extends '/' ? `${R}*` : `${R}/*`);
/**
 * The type of the routes object
 */
type Routes = Record<
  string,
  {
    path: string;
  }
>;
/**
 * Extracts the parameters from a dynamic path
 */
type ExtractParams<R extends string> = string extends R
  ? Array<string>
  : R extends `${infer _Start}/[${infer Param}]${infer _Rest}`
    ? [Param, ...ExtractParams<_Rest>]
    : [];
/**
 * Checks if a path has parameters
 */
type HasParams<R extends string> = ExtractParams<R> extends [] ? false : true;
/**
 * Extracts the parameters from a dynamic path if it has any
 */
type ParamsObject<R extends string> =
  HasParams<R> extends true ? Record<ExtractParams<R>[number], string> : never;
type RedirectOptions<Route extends string> =
  ParamsObject<Route> extends never
    ?
        | {
            query?: Record<string, string>;
            hash?: string;
          }
        | undefined
    : {
        query?: Record<string, string>;
        hash?: string;
        params: ParamsObject<Route>;
      };

/**
 * This is the type of the function that will be used to define the rules for each path
 */
type RuleFunction<
  T,
  RS extends Routes,
  R extends keyof RS & string = keyof RS & string,
> = (options: {
  data: T;
  path: R;
  params: ParamsObject<R>;
  next: () => void;
  redirect: (
    path: keyof RS & string,
    options?: RedirectOptions<keyof RS & string>,
  ) => void;
}) => Promise<void> | void;
/**
 * Authorization rules for each path
 */
type AuthRules<T, RS extends Routes, R extends keyof RS & string> = Partial<
  Record<Path<keyof RS & string>, RuleFunction<T, RS, R>[]>
>;
type BaseOptions<R extends Routes, T> = {
  /**
   * Function to fetch data so that it can be used in the authorization rules
   */
  fetch: (req: NextRequest) => Promise<T | undefined>;
  /**
   * Authorization rules for each path
   */
  rules: AuthRules<T, R, any>;
  /**
   * Paths that requiring authentication
   * Those paths will be the root paths of all the existing paths
   */
  authPaths: Array<keyof R & string>;
  /**
   * Function to call if the user is not authorized to access a path
   */
  onError?: (req: NextRequest) => Promise<NextResponse> | NextResponse;
};
type MiddlewareOptions<R extends Routes, T> = BaseOptions<R, T>;

export type {
  MiddlewareOptions,
  RuleFunction,
  Path,
  ParamsObject,
  AuthRules,
  BaseOptions,
  ExtractParams,
  Routes,
  RedirectOptions,
};
