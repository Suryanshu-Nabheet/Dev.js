'use strict';

const RELEASE_CHANNEL = process.env.RELEASE_CHANNEL;

const __EXPERIMENTAL__ =
  typeof RELEASE_CHANNEL === 'string'
    ? RELEASE_CHANNEL === 'experimental'
    : true;

const bundleTypes = {
  NODE_ES2015: 'NODE_ES2015',
  ESM_DEV: 'ESM_DEV',
  ESM_PROD: 'ESM_PROD',
  NODE_DEV: 'NODE_DEV',
  NODE_PROD: 'NODE_PROD',
  NODE_PROFILING: 'NODE_PROFILING',
  BUN_DEV: 'BUN_DEV',
  BUN_PROD: 'BUN_PROD',
  FB_WWW_DEV: 'FB_WWW_DEV',
  FB_WWW_PROD: 'FB_WWW_PROD',
  FB_WWW_PROFILING: 'FB_WWW_PROFILING',
  RN_OSS_DEV: 'RN_OSS_DEV',
  RN_OSS_PROD: 'RN_OSS_PROD',
  RN_OSS_PROFILING: 'RN_OSS_PROFILING',
  RN_FB_DEV: 'RN_FB_DEV',
  RN_FB_PROD: 'RN_FB_PROD',
  RN_FB_PROFILING: 'RN_FB_PROFILING',
  BROWSER_SCRIPT: 'BROWSER_SCRIPT',
  CJS_DTS: 'CJS_DTS',
  ESM_DTS: 'ESM_DTS',
};

const {
  NODE_ES2015,
  ESM_DEV,
  ESM_PROD,
  NODE_DEV,
  NODE_PROD,
  NODE_PROFILING,
  BUN_DEV,
  BUN_PROD,
  FB_WWW_DEV,
  FB_WWW_PROD,
  FB_WWW_PROFILING,
  RN_OSS_DEV,
  RN_OSS_PROD,
  RN_OSS_PROFILING,
  RN_FB_DEV,
  RN_FB_PROD,
  RN_FB_PROFILING,
  BROWSER_SCRIPT,
  CJS_DTS,
  ESM_DTS,
} = bundleTypes;

const moduleTypes = {
  // Devjs
  ISOMORPHIC: 'ISOMORPHIC',
  // Individual renderers. They bundle the reconciler. (e.g. DevjsDOM)
  RENDERER: 'RENDERER',
  // Helper packages that access specific renderer's internals. (e.g. TestUtils)
  RENDERER_UTILS: 'RENDERER_UTILS',
  // Standalone reconciler for third-party renderers.
  RECONCILER: 'RECONCILER',
};

const {ISOMORPHIC, RENDERER, RENDERER_UTILS, RECONCILER} = moduleTypes;

const bundles = [
  /******* Isomorphic *******/
  {
    bundleTypes: [
      NODE_DEV,
      NODE_PROD,
      FB_WWW_DEV,
      FB_WWW_PROD,
      FB_WWW_PROFILING,
      RN_FB_DEV,
      RN_FB_PROD,
      RN_FB_PROFILING,
    ],
    moduleType: ISOMORPHIC,
    entry: 'devjs',
    global: 'Devjs',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['DevjsNativeInternalFeatureFlags'],
  },

  /******* Isomorphic Shared Subset *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'devjs/src/DevjsServer.js',
    name: 'devjs.devjs-server',
    condition: 'devjs-server',
    global: 'Devjs',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* Devjs JSX Runtime *******/
  {
    bundleTypes: [
      NODE_DEV,
      NODE_PROD,
      NODE_PROFILING,
      // TODO: use on WWW.
      RN_FB_DEV,
      RN_FB_PROD,
      RN_FB_PROFILING,
    ],
    moduleType: ISOMORPHIC,
    entry: 'devjs/jsx-runtime',
    global: 'JSXRuntime',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'DevjsNativeInternalFeatureFlags'],
  },

  /******* Compiler Runtime *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD, NODE_PROFILING],
    moduleType: ISOMORPHIC,
    entry: 'devjs/compiler-runtime',
    global: 'CompilerRuntime',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs JSX Runtime Devjs Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'devjs/src/jsx/DevjsJSXServer.js',
    name: 'devjs-jsx-runtime.devjs-server',
    condition: 'devjs-server',
    global: 'JSXRuntime',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs JSX DEV Runtime *******/
  {
    bundleTypes: [
      NODE_DEV,
      NODE_PROD,
      NODE_PROFILING,
      FB_WWW_DEV,
      FB_WWW_PROD,
      FB_WWW_PROFILING,
      RN_FB_DEV,
      RN_FB_PROD,
      RN_FB_PROFILING,
    ],
    moduleType: ISOMORPHIC,
    entry: 'devjs/jsx-dev-runtime',
    global: 'JSXDEVRuntime',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs JSX DEV Runtime Devjs Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'devjs/src/jsx/DevjsJSXServer.js',
    name: 'devjs-jsx-dev-runtime.devjs-server',
    condition: 'devjs-server',
    global: 'JSXDEVRuntime',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs DOM *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-dom',
    global: 'DevjsDOM',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['devjs'],
  },

  /******* Devjs DOM Client *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-dom/client',
    global: 'DevjsDOM',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs DOM Profiling (Client) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROFILING],
    moduleType: RENDERER,
    entry: 'devjs-dom/profiling',
    global: 'DevjsDOM',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs DOM (www) *******/
  {
    bundleTypes: [FB_WWW_DEV, FB_WWW_PROD, FB_WWW_PROFILING],
    moduleType: RENDERER,
    entry: 'devjs-dom/src/DevjsDOMFB.js',
    global: 'DevjsDOM',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['devjs'],
  },

  /******* Devjs DOM (fbsource) *******/
  {
    bundleTypes: [RN_FB_DEV, RN_FB_PROD, RN_FB_PROFILING],
    moduleType: RENDERER,
    entry: 'devjs-dom',
    global: 'DevjsDOM',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs DOM Client (fbsource) *******/
  {
    bundleTypes: [RN_FB_DEV, RN_FB_PROD, RN_FB_PROFILING],
    moduleType: RENDERER,
    entry: 'devjs-dom/client',
    global: 'DevjsDOMClient',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom', 'DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs DOM Profiling (fbsource) *******/
  {
    bundleTypes: [RN_FB_DEV, RN_FB_PROD, RN_FB_PROFILING],
    moduleType: RENDERER,
    entry: 'devjs-dom/profiling',
    global: 'DevjsDOMProfiling',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['devjs', 'devjs-dom', 'DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs DOM Test Utils (fbsource) *******/
  {
    moduleType: RENDERER_UTILS,
    bundleTypes: [RN_FB_DEV, RN_FB_PROD, RN_FB_PROFILING],
    entry: 'devjs-dom/test-utils',
    global: 'DevjsDOMTestUtils',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom', 'DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs DOM Devjs Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-dom/src/DevjsDOMDevjsServer.js',
    name: 'devjs-dom.devjs-server',
    condition: 'devjs-server',
    global: 'DevjsDOM',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Test Utils *******/
  {
    moduleType: RENDERER_UTILS,
    bundleTypes: [NODE_DEV, NODE_PROD],
    entry: 'devjs-dom/test-utils',
    global: 'DevjsTestUtils',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs DOM - Testing *******/
  {
    moduleType: RENDERER,
    bundleTypes: __EXPERIMENTAL__ ? [NODE_DEV, NODE_PROD] : [],
    entry: 'devjs-dom/unstable_testing',
    global: 'DevjsDOMTesting',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs DOM - www - Testing *******/
  {
    moduleType: RENDERER,
    bundleTypes: [FB_WWW_DEV, FB_WWW_PROD],
    entry: 'devjs-dom/src/DevjsDOMTestingFB.js',
    global: 'DevjsDOMTesting',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs DOM Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD, FB_WWW_DEV, FB_WWW_PROD],
    moduleType: RENDERER,
    entry: 'devjs-dom/src/server/DevjsDOMLegacyServerBrowser.js',
    name: 'devjs-dom-server-legacy.browser',
    global: 'DevjsDOMServer',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
    babel: opts =>
      Object.assign({}, opts, {
        plugins: opts.plugins.concat([
          [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
        ]),
      }),
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-dom/src/server/DevjsDOMLegacyServerNode.js',
    name: 'devjs-dom-server-legacy.node',
    externals: ['devjs', 'stream', 'devjs-dom'],
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    babel: opts =>
      Object.assign({}, opts, {
        plugins: opts.plugins.concat([
          [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
        ]),
      }),
  },

  /******* Devjs DOM Fizz Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-dom/src/server/devjs-dom-server.browser.js',
    name: 'devjs-dom-server.browser',
    global: 'DevjsDOMServer',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-dom/src/server/devjs-dom-server.node.js',
    name: 'devjs-dom-server.node',
    global: 'DevjsDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [
      'devjs',
      'devjs-dom',
      'async_hooks',
      'crypto',
      'stream',
      'util',
    ],
  },
  {
    bundleTypes: __EXPERIMENTAL__ ? [FB_WWW_DEV, FB_WWW_PROD] : [],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-fb/src/DevjsDOMServerFB.js',
    global: 'DevjsDOMServerStreaming',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs DOM Fizz Server Edge *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-dom/src/server/devjs-dom-server.edge.js',
    name: 'devjs-dom-server.edge', // 'node_modules/devjs/*.js',

    global: 'DevjsDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs DOM Fizz Server Bun *******/
  {
    bundleTypes: [BUN_DEV, BUN_PROD],
    moduleType: RENDERER,
    entry: 'devjs-dom/src/server/devjs-dom-server.bun.js',
    name: 'devjs-dom-server.bun', // 'node_modules/devjs/*.js',

    global: 'DevjsDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom', 'crypto', 'stream', 'util'],
  },

  /******* Devjs DOM Fizz Server External Runtime *******/
  {
    bundleTypes: __EXPERIMENTAL__ ? [BROWSER_SCRIPT] : [],
    moduleType: RENDERER,
    entry: 'devjs-dom/unstable_server-external-runtime',
    outputPath: 'unstable_server-external-runtime.js',
    global: 'DevjsDOMServerExternalRuntime',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* Devjs HTML RSC *******/
  {
    bundleTypes: __EXPERIMENTAL__ ? [NODE_DEV, NODE_PROD] : [],
    moduleType: RENDERER,
    entry: 'devjs-markup/src/DevjsMarkupServer.js',
    name: 'devjs-markup.devjs-server',
    condition: 'devjs-server',
    global: 'DevjsMarkup',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs HTML Client *******/
  {
    bundleTypes: __EXPERIMENTAL__ ? [NODE_DEV, NODE_PROD] : [],
    moduleType: RENDERER,
    entry: 'devjs-markup/src/DevjsMarkupClient.js',
    name: 'devjs-markup',
    global: 'DevjsMarkup',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs Server DOM Webpack Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry:
      'devjs-server-dom-webpack/src/server/devjs-flight-dom-server.browser',
    name: 'devjs-server-dom-webpack-server.browser',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-webpack/src/server/devjs-flight-dom-server.node',
    name: 'devjs-server-dom-webpack-server.node',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [
      'devjs',
      'devjs-dom',
      'async_hooks',
      'crypto',
      'stream',
      'util',
    ],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-webpack/src/server/devjs-flight-dom-server.edge',
    name: 'devjs-server-dom-webpack-server.edge',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs Server DOM Webpack Client *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry:
      'devjs-server-dom-webpack/src/client/devjs-flight-dom-client.browser',
    name: 'devjs-server-dom-webpack-client.browser',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-webpack/src/client/devjs-flight-dom-client.node',
    name: 'devjs-server-dom-webpack-client.node',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom', 'util', 'crypto'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-webpack/src/client/devjs-flight-dom-client.edge',
    name: 'devjs-server-dom-webpack-client.edge',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs Server DOM Webpack Plugin *******/
  {
    bundleTypes: [NODE_ES2015],
    moduleType: RENDERER_UTILS,
    entry: 'devjs-server-dom-webpack/plugin',
    global: 'DevjsServerWebpackPlugin',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['fs', 'path', 'url', 'neo-async'],
  },

  /******* Devjs Server DOM Webpack Node.js Loader *******/
  {
    bundleTypes: [ESM_PROD],
    moduleType: RENDERER_UTILS,
    entry: 'devjs-server-dom-webpack/node-loader',
    condition: 'devjs-server',
    global: 'DevjsServerWebpackNodeLoader',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['acorn'],
  },

  /******* Devjs Server DOM Webpack Node.js CommonJS Loader *******/
  {
    bundleTypes: [NODE_ES2015],
    moduleType: RENDERER_UTILS,
    entry: 'devjs-server-dom-webpack/src/DevjsFlightWebpackNodeRegister',
    name: 'devjs-server-dom-webpack-node-register',
    condition: 'devjs-server',
    global: 'DevjsFlightWebpackNodeRegister',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['url', 'module', 'devjs-server-dom-webpack/server'],
  },

  /******* Devjs Server DOM Turbopack Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry:
      'devjs-server-dom-turbopack/src/server/devjs-flight-dom-server.browser',
    name: 'devjs-server-dom-turbopack-server.browser',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-turbopack/src/server/devjs-flight-dom-server.node',
    name: 'devjs-server-dom-turbopack-server.node',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [
      'devjs',
      'devjs-dom',
      'async_hooks',
      'crypto',
      'stream',
      'util',
    ],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-turbopack/src/server/devjs-flight-dom-server.edge',
    name: 'devjs-server-dom-turbopack-server.edge',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs Server DOM Turbopack Client *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry:
      'devjs-server-dom-turbopack/src/client/devjs-flight-dom-client.browser',
    name: 'devjs-server-dom-turbopack-client.browser',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-turbopack/src/client/devjs-flight-dom-client.node',
    name: 'devjs-server-dom-turbopack-client.node',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom', 'util'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-turbopack/src/client/devjs-flight-dom-client.edge',
    name: 'devjs-server-dom-turbopack-client.edge',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs Server DOM Parcel Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-parcel/src/server/devjs-flight-dom-server.browser',
    name: 'devjs-server-dom-parcel-server.browser',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-parcel/src/server/devjs-flight-dom-server.node',
    name: 'devjs-server-dom-parcel-server.node',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [
      'devjs',
      'devjs-dom',
      'async_hooks',
      'crypto',
      'stream',
      'util',
    ],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-parcel/src/server/devjs-flight-dom-server.edge',
    name: 'devjs-server-dom-parcel-server.edge',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs Server DOM Parcel Client *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-parcel/src/client/devjs-flight-dom-client.browser',
    name: 'devjs-server-dom-parcel-client.browser',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-parcel/src/client/devjs-flight-dom-client.node',
    name: 'devjs-server-dom-parcel-client.node',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom', 'util'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-parcel/src/client/devjs-flight-dom-client.edge',
    name: 'devjs-server-dom-parcel-client.edge',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },

  /******* Devjs Server DOM ESM Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-esm/src/server/devjs-flight-dom-server.node',
    name: 'devjs-server-dom-esm-server.node',
    condition: 'devjs-server',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [
      'devjs',
      'devjs-dom',
      'async_hooks',
      'crypto',
      'stream',
      'util',
    ],
  },

  /******* Devjs Server DOM ESM Client *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD, ESM_DEV, ESM_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-esm/client.browser',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom'],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-esm/client.node',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom', 'util'],
  },

  /******* Devjs Server DOM ESM Node.js Loader *******/
  {
    bundleTypes: [ESM_PROD],
    moduleType: RENDERER_UTILS,
    entry: 'devjs-server-dom-esm/node-loader',
    condition: 'devjs-server',
    global: 'DevjsServerESMNodeLoader',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['acorn'],
  },

  /******* Devjs Server DOM Unbundled Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-unbundled/src/server/devjs-flight-dom-server.node',
    name: 'devjs-server-dom-unbundled-server.node',
    condition: 'devjs-server',
    global: 'DevjsServerDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [
      'devjs',
      'devjs-dom',
      'async_hooks',
      'crypto',
      'stream',
      'util',
    ],
  },

  /******* Devjs Server DOM Unbundled Client *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-server-dom-unbundled/src/client/devjs-flight-dom-client.node',
    name: 'devjs-server-dom-unbundled-client.node',
    global: 'DevjsServerDOMClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'devjs-dom', 'util', 'crypto'],
  },

  /******* Devjs Server DOM Unbundled Node.js Loader *******/
  {
    bundleTypes: [ESM_PROD],
    moduleType: RENDERER_UTILS,
    entry: 'devjs-server-dom-unbundled/node-loader',
    condition: 'devjs-server',
    global: 'DevjsServerUnbundledNodeLoader',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['acorn'],
  },

  /******* Devjs Server DOM Unbundled Node.js CommonJS Loader *******/
  {
    bundleTypes: [NODE_ES2015],
    moduleType: RENDERER_UTILS,
    entry: 'devjs-server-dom-unbundled/src/DevjsFlightUnbundledNodeRegister',
    name: 'devjs-server-dom-unbundled-node-register',
    condition: 'devjs-server',
    global: 'DevjsFlightUnbundledNodeRegister',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['url', 'module', 'devjs-server-dom-unbundled/server'],
  },

  /******* Devjs Suspense Test Utils *******/
  {
    bundleTypes: [NODE_ES2015],
    moduleType: RENDERER_UTILS,
    entry: 'devjs-suspense-test-utils',
    global: 'DevjsSuspenseTestUtils',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs ART *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD, FB_WWW_DEV, FB_WWW_PROD],
    moduleType: RENDERER,
    entry: 'devjs-art',
    global: 'DevjsART',
    externals: ['devjs'],
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    babel: opts =>
      Object.assign({}, opts, {
        // Include JSX
        presets: opts.presets.concat([
          require.resolve('@babel/preset-devjs'),
          require.resolve('@babel/preset-flow'),
        ]),
        plugins: opts.plugins.concat([
          [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
        ]),
      }),
  },

  /******* Devjs Native Fabric *******/
  {
    bundleTypes: __EXPERIMENTAL__
      ? []
      : [RN_FB_DEV, RN_FB_PROD, RN_FB_PROFILING],
    moduleType: RENDERER,
    entry: 'devjs-native-renderer/fabric',
    global: 'DevjsFabric',
    externals: ['devjs-native', 'DevjsNativeInternalFeatureFlags'],
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    babel: opts =>
      Object.assign({}, opts, {
        plugins: opts.plugins.concat([
          [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
        ]),
      }),
  },
  {
    bundleTypes: [RN_OSS_DEV, RN_OSS_PROD, RN_OSS_PROFILING],
    moduleType: RENDERER,
    entry: 'devjs-native-renderer/fabric',
    global: 'DevjsFabric',
    // DevjsNativeInternalFeatureFlags temporary until we land enableRemoveConsolePatches.
    // Needs to be done before the next RN OSS release.
    externals: ['devjs-native', 'DevjsNativeInternalFeatureFlags'],
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    babel: opts =>
      Object.assign({}, opts, {
        plugins: opts.plugins.concat([
          [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
        ]),
      }),
  },

  /******* Devjs Test Renderer *******/
  {
    bundleTypes: [
      FB_WWW_DEV,
      NODE_DEV,
      NODE_PROD,
      RN_FB_DEV,
      RN_FB_PROD,
      RN_FB_PROFILING,
    ],
    moduleType: RENDERER,
    entry: 'devjs-test-renderer',
    global: 'DevjsTestRenderer',
    externals: [
      'devjs',
      'scheduler',
      'scheduler/unstable_mock',
      'DevjsNativeInternalFeatureFlags',
    ],
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    babel: opts =>
      Object.assign({}, opts, {
        plugins: opts.plugins.concat([
          [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
        ]),
      }),
  },

  /******* Devjs Noop Renderer (used for tests) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-noop-renderer',
    global: 'DevjsNoopRenderer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'scheduler', 'scheduler/unstable_mock', 'expect'],
  },

  /******* Devjs Noop Persistent Renderer (used for tests) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-noop-renderer/persistent',
    global: 'DevjsNoopRendererPersistent',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'scheduler', 'expect'],
  },

  /******* Devjs Noop Server Renderer (used for tests) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-noop-renderer/server',
    global: 'DevjsNoopRendererServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'scheduler', 'expect'],
  },

  /******* Devjs Noop Flight Server (used for tests) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-noop-renderer/flight-server',
    condition: 'devjs-server',
    global: 'DevjsNoopFlightServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [
      'devjs',
      'scheduler',
      'expect',
      'devjs-noop-renderer/flight-modules',
    ],
  },

  /******* Devjs Noop Flight Client (used for tests) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'devjs-noop-renderer/flight-client',
    global: 'DevjsNoopFlightClient',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [
      'devjs',
      'scheduler',
      'expect',
      'devjs-noop-renderer/flight-modules',
    ],
  },

  /******* Devjs Reconciler *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD, NODE_PROFILING, FB_WWW_DEV, FB_WWW_PROD],
    moduleType: RECONCILER,
    entry: 'devjs-reconciler',
    global: 'DevjsReconciler',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RECONCILER,
    entry: 'devjs-server',
    global: 'DevjsServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs Flight Server *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RECONCILER,
    entry: 'devjs-server/flight',
    condition: 'devjs-server',
    global: 'DevjsFlightServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Devjs Flight Client *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RECONCILER,
    entry: 'devjs-client/flight',
    global: 'DevjsFlightClient',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['devjs'],
  },

  /******* Reconciler Reflection *******/
  {
    moduleType: RENDERER_UTILS,
    bundleTypes: [NODE_DEV, NODE_PROD],
    entry: 'devjs-reconciler/reflection',
    global: 'DevjsFiberTreeReflection',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* Reconciler Constants *******/
  {
    moduleType: RENDERER_UTILS,
    bundleTypes: [NODE_DEV, NODE_PROD, FB_WWW_DEV, FB_WWW_PROD],
    entry: 'devjs-reconciler/constants',
    global: 'DevjsReconcilerConstants',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* Devjs Is *******/
  {
    bundleTypes: [
      NODE_DEV,
      NODE_PROD,
      FB_WWW_DEV,
      FB_WWW_PROD,
      RN_FB_DEV,
      RN_FB_PROD,
      RN_FB_PROFILING,
    ],
    moduleType: ISOMORPHIC,
    entry: 'devjs-is',
    global: 'DevjsIs',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs Debug Tools *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'devjs-debug-tools',
    global: 'DevjsDebugTools',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* Devjs Cache (experimental, old) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD, FB_WWW_DEV, FB_WWW_PROD],
    moduleType: ISOMORPHIC,
    entry: 'devjs-cache',
    global: 'DevjsCacheOld',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'scheduler'],
  },

  /******* Hook for managing subscriptions safely *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-subscription',
    global: 'useSubscription',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['devjs'],
  },

  /******* useSyncExternalStore *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store',
    global: 'useSyncExternalStore',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['devjs'],
  },

  /******* useSyncExternalStore (shim) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store/shim',
    global: 'useSyncExternalStore',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['devjs'],
  },

  /******* useSyncExternalStore (shim, native) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store/shim/index.native',
    global: 'useSyncExternalStore',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['devjs'],
  },

  /******* useSyncExternalStoreWithSelector *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store/with-selector',
    global: 'useSyncExternalStoreWithSelector',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['devjs'],
  },

  /******* useSyncExternalStoreWithSelector (shim) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store/shim/with-selector',
    global: 'useSyncExternalStoreWithSelector',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['devjs', 'use-sync-external-store/shim'],
  },

  /******* Devjs Scheduler (experimental) *******/
  {
    bundleTypes: [
      NODE_DEV,
      NODE_PROD,
      FB_WWW_DEV,
      FB_WWW_PROD,
      FB_WWW_PROFILING,
      RN_FB_DEV,
      RN_FB_PROD,
      RN_FB_PROFILING,
    ],
    moduleType: ISOMORPHIC,
    entry: 'scheduler',
    global: 'Scheduler',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs Scheduler Mock (experimental) *******/
  {
    bundleTypes: [
      NODE_DEV,
      NODE_PROD,
      FB_WWW_DEV,
      FB_WWW_PROD,
      RN_FB_DEV,
      RN_FB_PROD,
    ],
    moduleType: ISOMORPHIC,
    entry: 'scheduler/unstable_mock',
    global: 'SchedulerMock',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs Scheduler Native *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'scheduler/index.native',
    global: 'SchedulerNative',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['DevjsNativeInternalFeatureFlags'],
  },

  /******* Devjs Scheduler Post Task (experimental) *******/
  {
    bundleTypes: [
      NODE_DEV,
      NODE_PROD,
      FB_WWW_DEV,
      FB_WWW_PROD,
      FB_WWW_PROFILING,
    ],
    moduleType: ISOMORPHIC,
    entry: 'scheduler/unstable_post_task',
    global: 'SchedulerPostTask',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* Jest Devjs (experimental) *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'jest-devjs',
    global: 'JestDevjs',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['devjs', 'scheduler', 'scheduler/unstable_mock'],
  },

  /******* ESLint Plugin for Hooks *******/
  {
    // TODO: we're building this from typescript source now, but there's really
    // no reason to have both dev and prod for this package.  It's
    // currently required in order for the package to be copied over correctly.
    // So, it would be worth improving that flow.
    name: 'eslint-plugin-devjs-hooks',
    bundleTypes: [NODE_DEV, NODE_PROD, CJS_DTS],
    moduleType: ISOMORPHIC,
    entry: 'eslint-plugin-devjs-hooks/src/index.ts',
    global: 'ESLintPluginDevjsHooks',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    preferBuiltins: true,
    externals: [
      '@babel/core',
      'hermes-parser',
      'zod',
      'zod/v4',
      'zod-validation-error',
      'zod-validation-error/v4',
      'crypto',
      'util',
    ],
    tsconfig: './packages/eslint-plugin-devjs-hooks/tsconfig.json',
    prebuild: `mkdir -p ./compiler/packages/babel-plugin-devjs-compiler/dist && echo "module.exports = require('../src/index.ts');" > ./compiler/packages/babel-plugin-devjs-compiler/dist/index.js`,
  },

  /******* Devjs Fresh *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'devjs-refresh/babel',
    global: 'DevjsFreshBabelPlugin',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [],
  },
  {
    bundleTypes: [NODE_DEV, NODE_PROD, FB_WWW_DEV],
    moduleType: ISOMORPHIC,
    entry: 'devjs-refresh/runtime',
    global: 'DevjsFreshRuntime',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [],
  },
];

// Based on deep-freeze by substack (public domain)
function deepFreeze(o) {
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });
  return o;
}

// Don't accidentally mutate config as part of the build
deepFreeze(bundles);
deepFreeze(bundleTypes);
deepFreeze(moduleTypes);

function getFilename(bundle, bundleType) {
  let name = bundle.name || bundle.entry;
  const globalName = bundle.global;
  // we do this to replace / to -, for devjs-dom/server
  name = name.replace('/index.', '.').replace('/', '-');
  switch (bundleType) {
    case NODE_ES2015:
      return `${name}.js`;
    case BUN_DEV:
      return `${name}.development.js`;
    case BUN_PROD:
      return `${name}.production.js`;
    case ESM_DEV:
      return `${name}.development.js`;
    case ESM_PROD:
      return `${name}.production.js`;
    case NODE_DEV:
      return `${name}.development.js`;
    case NODE_PROD:
      return `${name}.production.js`;
    case NODE_PROFILING:
      return `${name}.profiling.js`;
    case FB_WWW_DEV:
    case RN_OSS_DEV:
    case RN_FB_DEV:
      return `${globalName}-dev.js`;
    case FB_WWW_PROD:
    case RN_OSS_PROD:
    case RN_FB_PROD:
      return `${globalName}-prod.js`;
    case FB_WWW_PROFILING:
    case RN_FB_PROFILING:
    case RN_OSS_PROFILING:
      return `${globalName}-profiling.js`;
    case BROWSER_SCRIPT:
      return `${name}.js`;
    case CJS_DTS:
    case ESM_DTS:
      return `${name}.d.ts`;
  }
}

let activeBundles = bundles;
if (process.env.BUNDLES_FILTER != null) {
  activeBundles = activeBundles.filter(
    bundle => bundle.name === process.env.BUNDLES_FILTER
  );
  if (activeBundles.length === 0) {
    throw new Error(
      `No bundles matched for BUNDLES_FILTER=${process.env.BUNDLES_FILTER}`
    );
  }
}

module.exports = {
  bundleTypes,
  moduleTypes,
  bundles: activeBundles,
  getFilename,
};
