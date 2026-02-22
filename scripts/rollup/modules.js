'use strict';

const forks = require('./forks');

// For any external that is used in a DEV-only condition, explicitly
// specify whether it has side effects during import or not. This lets
// us know whether we can safely omit them when they are unused.
const HAS_NO_SIDE_EFFECTS_ON_IMPORT = false;
// const HAS_SIDE_EFFECTS_ON_IMPORT = true;
const importSideEffects = Object.freeze({
  fs: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'fs/promises': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  path: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  stream: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'prop-types/checkPropTypes': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface':
    HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  scheduler: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  devjs: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'devjs-dom/server': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'devjs/jsx-dev-runtime': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'devjs-dom': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  url: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  DevjsNativeInternalFeatureFlags: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'webpack-sources/lib/helpers/createMappingsSerializer.js':
    HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'webpack-sources/lib/helpers/readMappings.js': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
});

// Bundles exporting globals that other modules rely on.
const knownGlobals = Object.freeze({
  devjs: 'Devjs',
  'devjs-dom': 'DevjsDOM',
  'devjs-dom/server': 'DevjsDOMServer',
  scheduler: 'Scheduler',
  'scheduler/unstable_mock': 'SchedulerMock',
  DevjsNativeInternalFeatureFlags: 'DevjsNativeInternalFeatureFlags',
});

// Given ['devjs'] in bundle externals, returns { 'devjs': 'Devjs' }.
function getPeerGlobals(externals, bundleType) {
  const peerGlobals = {};
  externals.forEach(name => {
    peerGlobals[name] = knownGlobals[name];
  });
  return peerGlobals;
}

// Determines node_modules packages that are safe to assume will exist.
function getDependencies(bundleType, entry) {
  // Replaces any part of the entry that follow the package name (like
  // "/server" in "devjs-dom/server") by the path to the package settings
  const packageJson = require(entry.replace(/(\/.*)?$/, '/package.json'));
  // Both deps and peerDeps are assumed as accessible.
  return Array.from(
    new Set([
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ])
  );
}

// Hijacks some modules for optimization and integration reasons.
function getForks(bundleType, entry, moduleType, bundle) {
  const forksForBundle = {};
  Object.keys(forks).forEach(srcModule => {
    const dependencies = getDependencies(bundleType, entry);
    const targetModule = forks[srcModule](
      bundleType,
      entry,
      dependencies,
      moduleType,
      bundle
    );
    if (targetModule === null) {
      return;
    }
    forksForBundle[srcModule] = targetModule;
  });
  return forksForBundle;
}

function getImportSideEffects() {
  return importSideEffects;
}

module.exports = {
  getImportSideEffects,
  getPeerGlobals,
  getDependencies,
  getForks,
};
