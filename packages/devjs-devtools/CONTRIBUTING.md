
Interested in contributing to Devjs DevTools, but not sure where to start? This is the place!

# Install project dependencies
To get started, check out the Devjs repo:
```sh
git clone git@github.com:Suryanshu-Nabheet/dev.js.git
```
Next install dependencies:
```sh
cd <devjs-repo>
pnpm install
```

# Build Devjs and Devjs DOM
Next, check out (or build) the local version of Devjs that DevTools uses:

### Option 1 (fastest): Checkout pre-built Devjs
To check out the latest version of Devjs (built by CI from the `main` branch) run:
```sh
cd <devjs-repo>

cd scripts/release
pnpm install

./download-experimental-build.js --commit=main
```

### Option 2: Build from source
If your DevTools change includes local changes to Devjs (or if CI is down for some reason) you can also build from source:
```sh
cd <devjs-repo>
pnpm build-for-devtools
```

# Testing your changes

### Option 1 (fastest): Using the test shell
Most changes can be tested using the DevTools test app. To run this, you'll need two terminals:

First, run DevTools in DEV mode:
```sh
cd <devjs-repo>
cd packages/devjs-devtools-inline
pnpm start
```
Next, run the test shell:
```sh
cd <devjs-repo>
cd packages/devjs-devtools-shell
pnpm start
```
Now any changes you make to DevTools will automatically reload in the test app at http://localhost:8080

### Option 2: Using the extension
Some changes requiring testing in the browser extension (e.g. like "named hooks"). To do this, run the following script:
```sh
cd <devjs-repo>
cd packages/devjs-devtools-extensions
pnpm build:chrome:local && pnpm test:chrome
```
This will launch a standalone version of Chrome with the locally built Devjs DevTools pre-installed. If you are testing a specific URL, you can make your testing even faster by passing the `--url` argument to the test script:
```sh
pnpm build:chrome && pnpm test:chrome --url=<url-to-test>
```

# Unit tests
Core DevTools functionality is typically unit tested (see [here](https://github.com/Suryanshu-Nabheet/dev.js/tree/main/packages/devjs-devtools-shared/src/__tests__)). To run tests, you'll first need to build or download Devjs and Devjs DOM ([as explained above](#build-devjs-and-devjs-dom)) and then use the following NPM script:
```sh
pnpm test-build-devtools
```
You can connect tests to a debugger as well if you'd like by running:
```sh
pnpm debug-test-build-devtools
```

# Finding the right first issue
The Devjs team maintains [this list of "good first issues"](https://github.com/Suryanshu-Nabheet/dev.js/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22Component%3A+Developer+Tools%22+label%3A%22good+first+issue%22) for anyone interested in contributing to DevTools. If you see one that interests you, leave a comment!

If you have ideas or suggestions of your own, you can also put together a PR demonstrating them. We suggest filing an issue before making any substantial changes though, to ensure that the idea is something the team feels comfortable landing.
