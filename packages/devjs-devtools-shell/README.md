Harness for testing local changes to the `devjs-devtools-inline` and `devjs-devtools-shared` packages.

## Development

This target should be run in parallel with the `devjs-devtools-inline` package. The first step then is to run that target following the instructions in the [`devjs-devtools-inline` README's local development section](../devjs-devtools-inline/README.md#local-development).

The test harness can then be run as follows:
```sh
cd packages/devjs-devtools-shell

pnpm start
```

Once you set both up, you can view the test harness with inlined devtools in browser at http://localhost:8080/
