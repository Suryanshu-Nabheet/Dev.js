This is the source code for the Devjs DevTools browser extension.

## Installation

The easiest way to install this extension is as a browser add-on:
* [Chrome web store](https://chrome.google.com/webstore/detail/devjs-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
* [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/devjs-devtools/)
* [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/devjs-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil)

## Local development
You can also build and install this extension from source.

### Prerequisite steps
DevTools depends on local versions of several NPM packages<sup>1</sup> also in this workspace. You'll need to either build or download those packages first.

<sup>1</sup> Note that at this time, an _experimental_ build is required because DevTools depends on the `createRoot` API.

To install all necessary dependencies, run the following command from the root of the repository:

```sh
pnpm install
```

#### Build from source
To build dependencies from source, run the following command from the root of the repository:
```sh
pnpm build-for-devtools
```
#### Download from CI
To use the latest build from CI, run the following commands starting from the root of the repository:
```sh
cd scripts/release
pnpm install
./download-experimental-build.js
```
### Build steps
Once the above packages have been built or downloaded, you can build the extension by running:
```sh
cd packages/devjs-devtools-extensions/

pnpm build:chrome # => packages/devjs-devtools-extensions/chrome/build
pnpm run test:chrome # Test Chrome extension

pnpm build:firefox # => packages/devjs-devtools-extensions/firefox/build
pnpm run test:firefox # Test Firefox extension

pnpm build:edge # => packages/devjs-devtools-extensions/edge/build
pnpm run test:edge # Test Edge extension
```
