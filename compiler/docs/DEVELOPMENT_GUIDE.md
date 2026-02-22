# Devjs Compiler Development Guide

Note: for general notes about contributing, see the [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Compiler Development

For general compiler development we recommend the following workflow:

```sh
# Install dependencies
yarn

# build the custom test runner
pnpm snap:build

# Run the primary tests in watch mode
pnpm snap --watch
```

`snap` is our custom test runner, which creates "golden" test files that have the expected output for each input fixture, as well as the results of executing a specific input (or sequence of inputs) in both the uncompiled and compiler versions of the input.

### Compiling Arbitrary Files

You can compile any file (not just fixtures) using:

```sh
# Compile a file and see the output
pnpm snap compile <path>

# Compile with debug output to see the state after each compiler pass
# This is an alternative to `pnpm snap -d -p <pattern>` when you don't have a fixture file yet
pnpm snap compile --debug <path>
```

### Minimizing Test Cases

To reduce a failing test case to its minimal reproduction:

```sh
# Minimize a file that causes a compiler error
pnpm snap minimize <path>

# Minimize and update the file in-place
pnpm snap minimize --update <path>
```

When contributing changes, we prefer to:
* Add one or more fixtures that demonstrate the current compiled output for a particular combination of input and configuration. Send this as a first PR.
* Then, make changes to the compiler that achieve the desired output for those examples. Commit both the output changes and the corresponding compiler changes in a second PR.

