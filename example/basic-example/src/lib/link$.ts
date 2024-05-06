export const routes = {
  "/admin": {
    "path": "/admin",
    "isDynamic": false,
    "params": {}
  },
  "/posts/[id]": {
    "path": "/posts/[id]",
    "isDynamic": true,
    "params": {
      "id": ""
    }
  },
  "/posts": {
    "path": "/posts",
    "isDynamic": false,
    "params": {}
  },
  "/": {
    "path": "/",
    "params": {},
    "isDynamic": false
  }
};
type IsEmptyObject<T> = keyof T extends never ? true : false;

type Link$Options<T extends keyof RoutesOutput = keyof RoutesOutput> =
  IsEmptyObject<RoutesOutput[T]["params"]> extends false
    ? {
        href: T;
        params: RoutesOutput[T]["params"];
        query?: Record<string, string | number | boolean>;
        hash?: string;
      }
    : {
        href: T;
        params?: RoutesOutput[T]["params"];
        query?: Record<string, string | number | boolean>;
        hash?: string;
      };

type RoutesOutput = typeof routes;

const link$ = <T extends keyof RoutesOutput = keyof RoutesOutput>({
  href,
  params,
  query,
  hash,
}: Link$Options<T>) => {
  const route = routes[href];
  let path = route.path;

  if (route.isDynamic) {
    const params_keys = Object.keys(params!);
    const params_values = Object.values(params!);
    path = params_keys.reduce((acc, key, index) => {
      return acc.replace(`[${key}]`, params_values[index] as string);
    }, route.path);
  }

  if (query) {
    const queryString = new URLSearchParams(
      query as Record<string, string>,
    ).toString();
    path += `?${queryString}`;
  }

  if (hash) {
    path += `#${hash}`;
  }

  return path;
};

export default link$;