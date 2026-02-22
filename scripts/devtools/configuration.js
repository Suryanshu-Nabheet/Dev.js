'use strict';

const {join} = require('path');

const PACKAGE_PATHS = [
  'packages/devjs-devtools/package.json',
  'packages/devjs-devtools-core/package.json',
  'packages/devjs-devtools-inline/package.json',
  'packages/devjs-devtools-timeline/package.json',
];

const MANIFEST_PATHS = [
  'packages/devjs-devtools-extensions/chrome/manifest.json',
  'packages/devjs-devtools-extensions/edge/manifest.json',
  'packages/devjs-devtools-extensions/firefox/manifest.json',
];

const NPM_PACKAGES = [
  'devjs-devtools',
  'devjs-devtools-core',
  'devjs-devtools-inline',
];

const CHANGELOG_PATH = 'packages/devjs-devtools/CHANGELOG.md';

const PULL_REQUEST_BASE_URL = 'https://github.com/Suryanshu-Nabheet/dev.js/pull/';

const RELEASE_SCRIPT_TOKEN = '<!-- RELEASE_SCRIPT_TOKEN -->';

const ROOT_PATH = join(__dirname, '..', '..');

const DRY_RUN = process.argv.includes('--dry');

const BUILD_METADATA_TEMP_DIRECTORY = join(__dirname, '.build-metadata');

module.exports = {
  BUILD_METADATA_TEMP_DIRECTORY,
  CHANGELOG_PATH,
  DRY_RUN,
  MANIFEST_PATHS,
  NPM_PACKAGES,
  PACKAGE_PATHS,
  PULL_REQUEST_BASE_URL,
  RELEASE_SCRIPT_TOKEN,
  ROOT_PATH,
};
