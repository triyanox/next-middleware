# Next.js Route Protection with `@triyanox/next-middleware`

`@triyanox/next-middleware` is a package that allows you to protect your Next.js routes (pages/apps routes, api routes...) in a type-safe way with an easy-to-use API.

## Installation

Install the package using your preferred package manager:

```bash
# pnpm
pnpm add @triyanox/next-middleware

# bun
bun add @triyanox/next-middleware

# npm
npm install @triyanox/next-middleware

# Yarn
yarn add @triyanox/next-middleware
```

## Usage

Follow these steps to protect your Next.js routes:

1. **Define the type of data for route checks**

```ts
type Data = User; // Replace User with your data type
```

2. **Import dependencies**

```ts
import Middleware, { RuleFunction, Routes } from "@triyanox/next-middleware";
// We've used `@triyanox/next-routes` to generate the routes object but you can supply your own routes object or type if you want as long as it satisfies the type `Routes`
import { routes } from "./lib/link$";
```
If you want to use `@triyanox/next-routes`, you can generate the routes check out the [documentation](
  https://github.com/triyanox/next-routes#readme
) for more information.

3. **Define route protection rules**

```ts
const isLoggedIn: RuleFunction<Data, typeof routes> = ({ data, next, redirect }) => {
  if (data) {
    return next();
  } else {
    return redirect("/login");
  }
};

const isAdmin: RuleFunction<Data, typeof routes> = ({ data, next, redirect }) => {
  if (data.role === "ADMIN") {
    return next();
  } else {
    return redirect("/login");
  }
};

const isOwnWorkspace: RuleFunction<Data, typeof routes, '/dashboard/workspaces/[workspaceId]/*'> = ({
  data,
  next,
  redirect,
  params,
}) => {
  if (data.workspaces.includes(params.workspaceId)) {
    return next();
  } else {
    return redirect("/login");
  }
};
```

4. **Construct the middleware and perform checks**

```ts
const middleware = new Middleware<typeof routes, Data>({
  fetch: async (req) => {
    // Fetch and return the data for route checks
  },
  rules: {
    "/login": [isNotLoggedIn],
    "/dashboard/*": [isLoggedIn, isAdmin],
    "/dashboard/workspaces/[workspaceId]/*": [isLoggedIn, isAdmin, isOwnWorkspace],
  },
  authPaths: ["/login", "/dashboard"],
  onError: async (req) => {
    // Handle errors and redirects
  },
});
```

5. **Export the middleware**

```ts
export default middleware.handle.bind(middleware);

export const config = {
  matcher: ["/((?!api/|_next/|_proxy/|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have any ideas or suggestions.