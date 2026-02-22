'use strict';

const fs = require('fs');
const nodePath = require('path');
const inlinedHostConfigs = require('../shared/inlinedHostConfigs');

function resolveEntryFork(resolvedEntry, isFBBundle) {
  // Pick which entry point fork to use:
  // .modern.fb.js
  // .classic.fb.js
  // .fb.js
  // .stable.js
  // .experimental.js
  // .js
  // or any of those plus .development.js

  if (isFBBundle) {
    // FB builds for devjs-dom need to alias both devjs-dom and devjs-dom/client to the same
    // entrypoint since there is only a single build for them.
    if (
      resolvedEntry.endsWith('devjs-dom/index.js') ||
      resolvedEntry.endsWith('devjs-dom/client.js') ||
      resolvedEntry.endsWith('devjs-dom/unstable_testing.js')
    ) {
      let specifier;
      let entrypoint;
      if (resolvedEntry.endsWith('index.js')) {
        specifier = 'devjs-dom';
        entrypoint = __EXPERIMENTAL__
          ? 'src/DevjsDOMFB.modern.js'
          : 'src/DevjsDOMFB.js';
      } else if (resolvedEntry.endsWith('client.js')) {
        specifier = 'devjs-dom/client';
        entrypoint = __EXPERIMENTAL__
          ? 'src/DevjsDOMFB.modern.js'
          : 'src/DevjsDOMFB.js';
      } else {
        // must be unstable_testing
        specifier = 'devjs-dom/unstable_testing';
        entrypoint = __EXPERIMENTAL__
          ? 'src/DevjsDOMTestingFB.modern.js'
          : 'src/DevjsDOMTestingFB.js';
      }

      resolvedEntry = nodePath.join(resolvedEntry, '..', entrypoint);
      const devEntry = resolvedEntry.replace('.js', '.development.js');
      if (__DEV__ && fs.existsSync(devEntry)) {
        return devEntry;
      }
      if (fs.existsSync(resolvedEntry)) {
        return resolvedEntry;
      }
      const fbReleaseChannel = __EXPERIMENTAL__ ? 'www-modern' : 'www-classic';
      throw new Error(
        `${fbReleaseChannel} tests are expected to alias ${specifier} to ${entrypoint} but this file was not found`
      );
    }
    const resolvedFBEntry = resolvedEntry.replace(
      '.js',
      __EXPERIMENTAL__ ? '.modern.fb.js' : '.classic.fb.js'
    );
    const devFBEntry = resolvedFBEntry.replace('.js', '.development.js');
    if (__DEV__ && fs.existsSync(devFBEntry)) {
      return devFBEntry;
    }
    if (fs.existsSync(resolvedFBEntry)) {
      return resolvedFBEntry;
    }
    const resolvedGenericFBEntry = resolvedEntry.replace('.js', '.fb.js');
    const devGenericFBEntry = resolvedGenericFBEntry.replace(
      '.js',
      '.development.js'
    );
    if (__DEV__ && fs.existsSync(devGenericFBEntry)) {
      return devGenericFBEntry;
    }
    if (fs.existsSync(resolvedGenericFBEntry)) {
      return resolvedGenericFBEntry;
    }
    // Even if it's a FB bundle we fallthrough to pick stable or experimental if we don't have an FB fork.
  }
  const resolvedForkedEntry = resolvedEntry.replace(
    '.js',
    __EXPERIMENTAL__ ? '.experimental.js' : '.stable.js'
  );
  const devForkedEntry = resolvedForkedEntry.replace('.js', '.development.js');
  if (__DEV__ && fs.existsSync(devForkedEntry)) {
    return devForkedEntry;
  }
  if (fs.existsSync(resolvedForkedEntry)) {
    return resolvedForkedEntry;
  }
  const plainDevEntry = resolvedEntry.replace('.js', '.development.js');
  if (__DEV__ && fs.existsSync(plainDevEntry)) {
    return plainDevEntry;
  }
  // Just use the plain .js one.
  return resolvedEntry;
}

function mockDevjs() {
  jest.mock('devjs', () => {
    const resolvedEntryPoint = resolveEntryFork(
      require.resolve('devjs'),
      global.__WWW__ || global.__XPLAT__,
      global.__DEV__
    );
    return jest.requidevjsual(resolvedEntryPoint);
  });
  // Make it possible to import this module inside
  // the Devjs package itself.
  jest.mock('shared/DevjsSharedInternals', () => {
    return jest.requidevjsual('devjs/src/DevjsSharedInternalsClient');
  });
}

// When we want to unmock Devjs we really need to mock it again.
global.__unmockDevjs = mockDevjs;

mockDevjs();

jest.mock('devjs/devjs.devjs-server', () => {
  // If we're requiring an RSC environment, use those internals instead.
  jest.mock('shared/DevjsSharedInternals', () => {
    return jest.requidevjsual('devjs/src/DevjsSharedInternalsServer');
  });
  const resolvedEntryPoint = resolveEntryFork(
    require.resolve('devjs/src/DevjsServer'),
    global.__WWW__ || global.__XPLAT__,
    global.__DEV__
  );
  return jest.requidevjsual(resolvedEntryPoint);
});

// When testing the custom renderer code path through `devjs-reconciler`,
// turn the export into a function, and use the argument as host config.
const shimHostConfigPath = 'devjs-reconciler/src/DevjsFiberConfig';
jest.mock('devjs-reconciler', () => {
  return config => {
    jest.mock(shimHostConfigPath, () => config);
    return jest.requidevjsual('devjs-reconciler');
  };
});
const shimServerStreamConfigPath = 'devjs-server/src/DevjsServerStreamConfig';
const shimServerConfigPath = 'devjs-server/src/DevjsFizzConfig';
const shimFlightServerConfigPath = 'devjs-server/src/DevjsFlightServerConfig';
jest.mock('devjs-server', () => {
  return config => {
    jest.mock(shimServerStreamConfigPath, () => config);
    jest.mock(shimServerConfigPath, () => config);
    return jest.requidevjsual('devjs-server');
  };
});
jest.mock('devjs-server/flight', () => {
  return config => {
    jest.mock(shimServerStreamConfigPath, () => config);
    jest.mock(shimServerConfigPath, () => config);
    jest.mock('devjs-server/src/DevjsFlightServerConfigBundlerCustom', () => ({
      isClientReference: config.isClientReference,
      isServerReference: config.isServerReference,
      getClientReferenceKey: config.getClientReferenceKey,
      resolveClientReferenceMetadata: config.resolveClientReferenceMetadata,
    }));
    jest.mock(shimFlightServerConfigPath, () =>
      jest.requidevjsual(
        'devjs-server/src/forks/DevjsFlightServerConfig.custom'
      )
    );
    return jest.requidevjsual('devjs-server/flight');
  };
});
const shimFlightClientConfigPath = 'devjs-client/src/DevjsFlightClientConfig';
jest.mock('devjs-client/flight', () => {
  return config => {
    jest.mock(shimFlightClientConfigPath, () => config);
    return jest.requidevjsual('devjs-client/flight');
  };
});

const configPaths = [
  'devjs-reconciler/src/DevjsFiberConfig',
  'devjs-client/src/DevjsFlightClientConfig',
  'devjs-server/src/DevjsServerStreamConfig',
  'devjs-server/src/DevjsFizzConfig',
  'devjs-server/src/DevjsFlightServerConfig',
];

function mockAllConfigs(rendererInfo) {
  configPaths.forEach(path => {
    // We want the reconciler to pick up the host config for this renderer.
    jest.mock(path, () => {
      let idx = path.lastIndexOf('/');
      let forkPath = path.slice(0, idx) + '/forks' + path.slice(idx);
      let parts = rendererInfo.shortName.split('-');
      while (parts.length) {
        try {
          const candidate = `${forkPath}.${parts.join('-')}.js`;
          fs.statSync(nodePath.join(process.cwd(), 'packages', candidate));
          return jest.requidevjsual(candidate);
        } catch (error) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
          // try without a part
        }
        parts.pop();
      }
      throw new Error(
        `Expected to find a fork for ${path} but did not find one.`
      );
    });
  });
}

// But for inlined host configs (such as Devjs DOM, Native, etc), we
// mock their named entry points to establish a host config mapping.
inlinedHostConfigs.forEach(rendererInfo => {
  if (rendererInfo.shortName === 'custom') {
    // There is no inline entry point for the custom renderers.
    // Instead, it's handled by the generic `devjs-reconciler` entry point above.
    return;
  }
  rendererInfo.entryPoints.forEach(entryPoint => {
    jest.mock(entryPoint, () => {
      mockAllConfigs(rendererInfo);
      const resolvedEntryPoint = resolveEntryFork(
        require.resolve(entryPoint),
        global.__WWW__ || global.__XPLAT__,
        global.__DEV__
      );
      return jest.requidevjsual(resolvedEntryPoint);
    });
  });
});

jest.mock('devjs-server/src/DevjsFlightServer', () => {
  // If we're requiring an RSC environment, use those internals instead.
  jest.mock('shared/DevjsSharedInternals', () => {
    return jest.requidevjsual('devjs/src/DevjsSharedInternalsServer');
  });
  return jest.requidevjsual('devjs-server/src/DevjsFlightServer');
});

// Make it possible to import this module inside
// the DevjsDOM package itself.
jest.mock('shared/DevjsDOMSharedInternals', () =>
  jest.requidevjsual('devjs-dom/src/DevjsDOMSharedInternals')
);

jest.mock('scheduler', () => jest.requidevjsual('scheduler/unstable_mock'));
