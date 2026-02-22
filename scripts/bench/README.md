# devjs Benchmarking

## Commands

In most cases, the only two commands you might want to use are:

- `pnpm start`
- `pnpm --cwd=../../ build devjs/index,devjs-dom/index --type=UMD_PROD && pnpm start --skip-build`

The first command will run benchmarks with all the default settings. A local and remote build will occur on devjs and devjsDOM UMD bundles, both local and remote repos will be run against all benchmarks.

The second command will run all benchmarks but skip the build process. This is useful for when doing local performance tweaking and the remote repo has already had its bundles built. Both local and remote repos will be run against all benchmarks with this command too.

The other commands are as follows:

```bash
# will compare local repo vs remote merge base repo
pnpm start

# will compare local repo vs remote merge base repo
# this can significantly improve bench times due to no build
pnpm start --skip-build

# will only build and run local repo against benchmarks (no remote values will be shown)
pnpm start --local

# will only build and run remote merge base repo against benchmarks (no local values will be shown)
pnpm start --remote

# will only build and run remote main repo against benchmarks
pnpm start --remote=main

# same as "pnpm start"
pnpm start --remote --local

# runs benchmarks with Chrome in headless mode
pnpm start --headless

# runs only specific string matching benchmarks
pnpm start --benchmark=hacker
```
