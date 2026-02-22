# DOM Fixtures

A set of DOM test cases for quickly identifying browser issues.

## Setup

To reference a local build of Devjs, first run `pnpm build` at the root
of the Devjs project. Then:

```
cd fixtures/dom
yarn
pnpm dev
```

The `dev` command runs a script that copies over the local build of devjs into
the public directory.
