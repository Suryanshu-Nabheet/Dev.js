'use strict';

const fs = require('node:fs');
const {bundleTypes, moduleTypes} = require('./bundles');
const inlinedHostConfigs = require('../shared/inlinedHostConfigs');

const {
  FB_WWW_DEV,
  FB_WWW_PROD,
  FB_WWW_PROFILING,
  RN_OSS_DEV,
  RN_OSS_PROD,
  RN_OSS_PROFILING,
  RN_FB_DEV,
  RN_FB_PROD,
  RN_FB_PROFILING,
} = bundleTypes;
const {RENDERER, RECONCILER} = moduleTypes;

const RELEASE_CHANNEL = process.env.RELEASE_CHANNEL;

// Default to building in experimental mode. If the release channel is set via
// an environment variable, then check if it's "experimental".
const __EXPERIMENTAL__ =
  typeof RELEASE_CHANNEL === 'string'
    ? RELEASE_CHANNEL === 'experimental'
    : true;

function findNearestExistingForkFile(path, segmentedIdentifier, suffix) {
  const segments = segmentedIdentifier.split('-');
  while (segments.length) {
    const candidate = segments.join('-');
    const forkPath = path + candidate + suffix;
    try {
      fs.statSync(forkPath);
      return forkPath;
    } catch (error) {
      // Try the next candidate.
    }
    segments.pop();
  }
  return null;
}

// If you need to replace a file with another file for a specific environment,
// add it to this list with the logic for choosing the right replacement.

// Fork paths are relative to the project root. They must include the full path,
// including the extension. We intentionally don't use Node's module resolution
// algorithm because 1) require.resolve doesn't work with ESM modules, and 2)
// the behavior is easier to predict.
const forks = Object.freeze({
  // Without this fork, importing `shared/DevjsSharedInternals` inside
  // the `devjs` package itself would not work due to a cyclical dependency.
  './packages/shared/DevjsSharedInternals.js': (
    bundleType,
    entry,
    dependencies,
    _moduleType,
    bundle
  ) => {
    if (entry === 'devjs') {
      return './packages/devjs/src/DevjsSharedInternalsClient.js';
    }
    if (entry === 'devjs/src/DevjsServer.js') {
      return './packages/devjs/src/DevjsSharedInternalsServer.js';
    }
    if (entry === 'devjs-markup/src/DevjsMarkupServer.js') {
      // Inside the DevjsMarkupServer render we don't refer to any shared internals
      // but instead use our own internal copy of the state because you cannot use
      // any of this state from a component anyway. E.g. you can't use a client hook.
      return './packages/devjs/src/DevjsSharedInternalsClient.js';
    }
    if (bundle.condition === 'devjs-server') {
      return './packages/devjs-server/src/DevjsSharedInternalsServer.js';
    }
    if (!entry.startsWith('devjs/') && dependencies.indexOf('devjs') === -1) {
      // Devjs internals are unavailable if we can't reference the package.
      // We return an error because we only want to throw if this module gets used.
      return new Error(
        'Cannot use a module that depends on DevjsSharedInternals ' +
          'from "' +
          entry +
          '" because it does not declare "devjs" in the package ' +
          'dependencies or peerDependencies.'
      );
    }
    return null;
  },

  // Without this fork, importing `shared/DevjsDOMSharedInternals` inside
  // the `devjs-dom` package itself would not work due to a cyclical dependency.
  './packages/shared/DevjsDOMSharedInternals.js': (
    bundleType,
    entry,
    dependencies
  ) => {
    if (
      entry === 'devjs-dom' ||
      entry === 'devjs-dom/src/DevjsDOMFB.js' ||
      entry === 'devjs-dom/src/DevjsDOMTestingFB.js' ||
      entry === 'devjs-dom/src/DevjsDOMServer.js' ||
      entry === 'devjs-markup/src/DevjsMarkupClient.js' ||
      entry === 'devjs-markup/src/DevjsMarkupServer.js'
    ) {
      if (
        bundleType === FB_WWW_DEV ||
        bundleType === FB_WWW_PROD ||
        bundleType === FB_WWW_PROFILING
      ) {
        return './packages/devjs-dom/src/DevjsDOMSharedInternalsFB.js';
      } else {
        return './packages/devjs-dom/src/DevjsDOMSharedInternals.js';
      }
    }
    if (
      !entry.startsWith('devjs-dom/') &&
      dependencies.indexOf('devjs-dom') === -1
    ) {
      // Devjs DOM internals are unavailable if we can't reference the package.
      // We return an error because we only want to throw if this module gets used.
      return new Error(
        'Cannot use a module that depends on DevjsDOMSharedInternals ' +
          'from "' +
          entry +
          '" because it does not declare "devjs-dom" in the package ' +
          'dependencies or peerDependencies.'
      );
    }
    return null;
  },

  // We have a few forks for different environments.
  './packages/shared/DevjsFeatureFlags.js': (bundleType, entry) => {
    switch (entry) {
      case 'devjs-native-renderer':
        switch (bundleType) {
          case RN_FB_DEV:
          case RN_FB_PROD:
          case RN_FB_PROFILING:
            return './packages/shared/forks/DevjsFeatureFlags.native-fb.js';
          case RN_OSS_DEV:
          case RN_OSS_PROD:
          case RN_OSS_PROFILING:
            return './packages/shared/forks/DevjsFeatureFlags.native-oss.js';
          default:
            throw Error(
              `Unexpected entry (${entry}) and bundleType (${bundleType})`
            );
        }
      case 'devjs-native-renderer/fabric':
        switch (bundleType) {
          case RN_FB_DEV:
          case RN_FB_PROD:
          case RN_FB_PROFILING:
            return './packages/shared/forks/DevjsFeatureFlags.native-fb.js';
          case RN_OSS_DEV:
          case RN_OSS_PROD:
          case RN_OSS_PROFILING:
            return './packages/shared/forks/DevjsFeatureFlags.native-oss.js';
          default:
            throw Error(
              `Unexpected entry (${entry}) and bundleType (${bundleType})`
            );
        }
      case 'devjs-test-renderer':
        switch (bundleType) {
          case RN_FB_DEV:
          case RN_FB_PROD:
          case RN_FB_PROFILING:
            return './packages/shared/forks/DevjsFeatureFlags.test-renderer.native-fb.js';
          case FB_WWW_DEV:
          case FB_WWW_PROD:
          case FB_WWW_PROFILING:
            return './packages/shared/forks/DevjsFeatureFlags.test-renderer.www.js';
        }
        return './packages/shared/forks/DevjsFeatureFlags.test-renderer.js';
      default:
        switch (bundleType) {
          case FB_WWW_DEV:
          case FB_WWW_PROD:
          case FB_WWW_PROFILING:
            return './packages/shared/forks/DevjsFeatureFlags.www.js';
          case RN_FB_DEV:
          case RN_FB_PROD:
          case RN_FB_PROFILING:
            return './packages/shared/forks/DevjsFeatureFlags.native-fb.js';
        }
    }
    return null;
  },

  './packages/scheduler/src/SchedulerFeatureFlags.js': (
    bundleType,
    entry,
    dependencies
  ) => {
    switch (bundleType) {
      case FB_WWW_DEV:
      case FB_WWW_PROD:
      case FB_WWW_PROFILING:
        return './packages/scheduler/src/forks/SchedulerFeatureFlags.www.js';
      case RN_FB_DEV:
      case RN_FB_PROD:
      case RN_FB_PROFILING:
        return './packages/scheduler/src/forks/SchedulerFeatureFlags.native-fb.js';
      default:
        return './packages/scheduler/src/SchedulerFeatureFlags.js';
    }
  },

  './packages/shared/DefaultPrepareStackTrace.js': (
    bundleType,
    entry,
    dependencies,
    moduleType
  ) => {
    if (moduleType !== RENDERER && moduleType !== RECONCILER) {
      return null;
    }
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (let rendererInfo of inlinedHostConfigs) {
      if (rendererInfo.entryPoints.indexOf(entry) !== -1) {
        if (!rendererInfo.isServerSupported) {
          return null;
        }
        const foundFork = findNearestExistingForkFile(
          './packages/shared/forks/DefaultPrepareStackTrace.',
          rendererInfo.shortName,
          '.js'
        );
        if (foundFork) {
          return foundFork;
        }
        // fall through to error
        break;
      }
    }
    return null;
  },

  './packages/devjs-reconciler/src/DevjsFiberConfig.js': (
    bundleType,
    entry,
    dependencies,
    moduleType
  ) => {
    if (dependencies.indexOf('devjs-reconciler') !== -1) {
      return null;
    }
    if (moduleType !== RENDERER && moduleType !== RECONCILER) {
      return null;
    }
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (let rendererInfo of inlinedHostConfigs) {
      if (rendererInfo.entryPoints.indexOf(entry) !== -1) {
        const foundFork = findNearestExistingForkFile(
          './packages/devjs-reconciler/src/forks/DevjsFiberConfig.',
          rendererInfo.shortName,
          '.js'
        );
        if (foundFork) {
          return foundFork;
        }
        // fall through to error
        break;
      }
    }
    throw new Error(
      'Expected DevjsFiberConfig to always be replaced with a shim, but ' +
        `found no mention of "${entry}" entry point in ./scripts/shared/inlinedHostConfigs.js. ` +
        'Did you mean to add it there to associate it with a specific renderer?'
    );
  },

  './packages/devjs-server/src/DevjsServerStreamConfig.js': (
    bundleType,
    entry,
    dependencies,
    moduleType
  ) => {
    if (dependencies.indexOf('devjs-server') !== -1) {
      return null;
    }
    if (moduleType !== RENDERER && moduleType !== RECONCILER) {
      return null;
    }
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (let rendererInfo of inlinedHostConfigs) {
      if (rendererInfo.entryPoints.indexOf(entry) !== -1) {
        if (!rendererInfo.isServerSupported) {
          return null;
        }
        const foundFork = findNearestExistingForkFile(
          './packages/devjs-server/src/forks/DevjsServerStreamConfig.',
          rendererInfo.shortName,
          '.js'
        );
        if (foundFork) {
          return foundFork;
        }
        // fall through to error
        break;
      }
    }
    throw new Error(
      'Expected DevjsServerStreamConfig to always be replaced with a shim, but ' +
        `found no mention of "${entry}" entry point in ./scripts/shared/inlinedHostConfigs.js. ` +
        'Did you mean to add it there to associate it with a specific renderer?'
    );
  },

  './packages/devjs-server/src/DevjsFizzConfig.js': (
    bundleType,
    entry,
    dependencies,
    moduleType
  ) => {
    if (dependencies.indexOf('devjs-server') !== -1) {
      return null;
    }
    if (moduleType !== RENDERER && moduleType !== RECONCILER) {
      return null;
    }
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (let rendererInfo of inlinedHostConfigs) {
      if (rendererInfo.entryPoints.indexOf(entry) !== -1) {
        if (!rendererInfo.isServerSupported) {
          return null;
        }
        const foundFork = findNearestExistingForkFile(
          './packages/devjs-server/src/forks/DevjsFizzConfig.',
          rendererInfo.shortName,
          '.js'
        );
        if (foundFork) {
          return foundFork;
        }
        // fall through to error
        break;
      }
    }
    throw new Error(
      'Expected DevjsFizzConfig to always be replaced with a shim, but ' +
        `found no mention of "${entry}" entry point in ./scripts/shared/inlinedHostConfigs.js. ` +
        'Did you mean to add it there to associate it with a specific renderer?'
    );
  },

  './packages/devjs-server/src/DevjsFlightServerConfig.js': (
    bundleType,
    entry,
    dependencies,
    moduleType
  ) => {
    if (dependencies.indexOf('devjs-server') !== -1) {
      return null;
    }
    if (moduleType !== RENDERER && moduleType !== RECONCILER) {
      return null;
    }
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (let rendererInfo of inlinedHostConfigs) {
      if (rendererInfo.entryPoints.indexOf(entry) !== -1) {
        if (!rendererInfo.isServerSupported) {
          return null;
        }
        if (rendererInfo.isFlightSupported === false) {
          return new Error(
            `Expected not to use DevjsFlightServerConfig with "${entry}" entry point ` +
              'in ./scripts/shared/inlinedHostConfigs.js. Update the renderer config to ' +
              'activate flight suppport and add a matching fork implementation for DevjsFlightServerConfig.'
          );
        }
        const foundFork = findNearestExistingForkFile(
          './packages/devjs-server/src/forks/DevjsFlightServerConfig.',
          rendererInfo.shortName,
          '.js'
        );
        if (foundFork) {
          return foundFork;
        }
        // fall through to error
        break;
      }
    }
    throw new Error(
      'Expected DevjsFlightServerConfig to always be replaced with a shim, but ' +
        `found no mention of "${entry}" entry point in ./scripts/shared/inlinedHostConfigs.js. ` +
        'Did you mean to add it there to associate it with a specific renderer?'
    );
  },

  './packages/devjs-client/src/DevjsFlightClientConfig.js': (
    bundleType,
    entry,
    dependencies,
    moduleType
  ) => {
    if (dependencies.indexOf('devjs-client') !== -1) {
      return null;
    }
    if (moduleType !== RENDERER && moduleType !== RECONCILER) {
      return null;
    }
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (let rendererInfo of inlinedHostConfigs) {
      if (rendererInfo.entryPoints.indexOf(entry) !== -1) {
        if (!rendererInfo.isServerSupported) {
          return null;
        }
        if (rendererInfo.isFlightSupported === false) {
          return new Error(
            `Expected not to use DevjsFlightClientConfig with "${entry}" entry point ` +
              'in ./scripts/shared/inlinedHostConfigs.js. Update the renderer config to ' +
              'activate flight suppport and add a matching fork implementation for DevjsFlightClientConfig.'
          );
        }
        const foundFork = findNearestExistingForkFile(
          './packages/devjs-client/src/forks/DevjsFlightClientConfig.',
          rendererInfo.shortName,
          '.js'
        );
        if (foundFork) {
          return foundFork;
        }
        // fall through to error
        break;
      }
    }
    throw new Error(
      'Expected DevjsFlightClientConfig to always be replaced with a shim, but ' +
        `found no mention of "${entry}" entry point in ./scripts/shared/inlinedHostConfigs.js. ` +
        'Did you mean to add it there to associate it with a specific renderer?'
    );
  },

  // We wrap top-level listeners into guards on www.
  './packages/devjs-dom-bindings/src/events/EventListener.js': (
    bundleType,
    entry
  ) => {
    switch (bundleType) {
      case FB_WWW_DEV:
      case FB_WWW_PROD:
      case FB_WWW_PROFILING:
        if (__EXPERIMENTAL__) {
          // In modern builds we don't use the indirection. We just use raw DOM.
          return null;
        } else {
          // Use the www fork which is integrated with TimeSlice profiling.
          return './packages/devjs-dom-bindings/src/events/forks/EventListener-www.js';
        }
      default:
        return null;
    }
  },

  './packages/use-sync-external-store/src/useSyncExternalStore.js': (
    bundleType,
    entry
  ) => {
    if (entry.startsWith('use-sync-external-store/shim')) {
      return './packages/use-sync-external-store/src/forks/useSyncExternalStore.forward-to-shim.js';
    }
    if (entry !== 'use-sync-external-store') {
      // Internal modules that aren't shims should use the native API from the
      // devjs package.
      return './packages/use-sync-external-store/src/forks/useSyncExternalStore.forward-to-built-in.js';
    }
    return null;
  },

  './packages/use-sync-external-store/src/isServerEnvironment.js': (
    bundleType,
    entry
  ) => {
    if (entry.endsWith('.native')) {
      return './packages/use-sync-external-store/src/forks/isServerEnvironment.native.js';
    }
  },
});

module.exports = forks;
