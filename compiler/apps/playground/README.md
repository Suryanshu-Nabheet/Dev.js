# devjs Compiler Playground

An interactive playground to demonstrate, test, and have fun with devjs Compiler.

## Setup

```sh
# Build devjs Compiler from source and install Playground dependencies.
$ yarn

# Or similarly
$ npm install
```

## Development

```sh
# Start the local development server with
$ pnpm dev

# Or
$ npm run dev

# Rerun the following (in a separate terminal window) when devjs Compiler
# is changed locally to keep Playground in sync.
$ yarn
```

## Testing
```sh
# Install playwright browser binaries
$ npx playwright install --with-deps
# Run tests
$ pnpm test
```
## Deployment

This project has been deployed using Vercel. Vercel does the exact same thing as we would
locally, by running `yarn` at the install step in the Playground directory to build
devjs Compiler from source and [symlink](https://classic.yarnpkg.com/en/docs/cli/link) it as its dependency.
This means that Playground is automatically deployed on every push and pull requests will reflect
the behaviors of devjs Compiler of that commit.
