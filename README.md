# Next.js Route Protection with `@triyanox/next-middleware`

`@triyanox/next-middleware` is a user-friendly, type-safe package designed for route protection in your Next.js applications. It can be applied to pages, apps routes, and API routes.

## Installation

You can install the package using your preferred package manager:

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

## How to Use

Here are the steps to effectively use `@triyanox/next-middleware` for route protection:

1. **Define the Data Type for Route Checks**

Firstly, you need to specify the type of data that will be used for route checks. Here we use `User` as an example, but you can replace it with your own data type.

```ts
type Data = User; // Replace User with your own data type
```

2. **Import Dependencies**

Next, import the `Middleware` class, the `RuleFunction` type, and the `Routes` type from the package. If you wish, you can also import the `routes` object from `@triyanox/next-routes` to generate the routes object. Nonetheless, you can provide your own routes object or type as long as it fulfills the `Routes` type.

```ts
import Middleware, { RuleFunction, Routes } from "@triyanox/next-middleware";
import { routes } from "@/lib/link$";
```

To use `@triyanox/next-routes` for generating the routes, refer to the [documentation](https://github.com/triyanox/next-routes#readme) for more information.

3. **Define Route Protection Rules**

You will then define the rules for route protection using the `RuleFunction` type. For cleaner code, you can define these rules in separate files and import them into the main file. You can also define rules for specific routes using the `RuleFunction` type with the route path as the third type argument for added type safety.

The `RuleFunction` type has three type arguments:

- `Data`: The type of data for route checks.
- `Routes`: The type of the routes object.
- `Path` (optional): The path of the route for type safety.

The `RuleFunction` type takes an object with the following properties:

- `data`: The data for route checks.
- `next`: A function to proceed to the next rule or route.
- `redirect`: A function to redirect to a specific route.
- `params`: An object containing the route parameters if the rule is for a specific dynamic route.
- `path`: The current path of the route.

These rules can be asynchronous functions. Here's an example of defining rules:

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

4. **Construct the Middleware and Perform Checks**

Create a middleware using the `Middleware` class and perform the route checks. The `Middleware` class needs:

- `Routes`: The type of the routes object.
- `Data`: The type of data for route checks.

It also takes an object with the following properties:

- `fetch`: An async function to fetch the data for route checks, which will be passed to the rules.
- `rules`: An object where the keys are the paths of the routes and the values are arrays of rules for the routes. The paths can be specific routes or route patterns (We support wildcard paths for the current version we plan to add regex support in the future).
- `authPaths`: An array of base paths where the rules should be applied.
- `onError`: An async function to handle errors and redirects.

Here's an example of constructing the middleware:

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

5. **Export the Middleware**

Finally, export the middleware and the config object for use in your Next.js app. In this example, we bind the `handle` method to the middleware instance and export it as the default export. However, you can create your own handler function and export it by wrapping the middleware instance in your function.

```ts
export default middleware.handle.bind(middleware);

export const config = {
  matcher: ["/((?!api/|_next/|_proxy/|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributions

We welcome contributions! Feel free to open an issue or submit a pull request if you have ideas or suggestions for improvement.