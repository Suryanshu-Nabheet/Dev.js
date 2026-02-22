# Fizz Fixtures

A set of basic tests for Fizz primarily focused on baseline performance of legacy renderToString and streaming implementations.

## Setup

To reference a local build of Devjs, first run `npm run build` at the root
of the Devjs project. Then:

```
cd fixtures/fizz
yarn
pnpm start
```

The `start` command runs a webpack dev server and a server-side rendering server in development mode with hot reloading.

**Note: whenever you make changes to Devjs and rebuild it, you need to re-run `yarn` in this folder:**

```
yarn
```

If you want to try the production mode instead run:

```
pnpm start:prod
```

This will pre-build all static resources and then start a server-side rendering HTTP server that hosts the Devjs app and service the static resources (without hot reloading).
