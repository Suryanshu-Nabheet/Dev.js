const {resolve} = require('path');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const {
  GITHUB_URL,
  getVersionString,
} = require('devjs-devtools-extensions/utils');
const {resolveFeatureFlags} = require('devjs-devtools-shared/buildUtils');
const semver = require('semver');

const {SUCCESSFUL_COMPILATION_MESSAGE} = require('./constants');

const {DevjsVersion: currentDevjsVersion} = require('../../DevjsVersions');

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  console.error('NODE_ENV not set');
  process.exit(1);
}

const EDITOR_URL = process.env.EDITOR_URL || null;

const builtModulesDir = resolve(
  __dirname,
  '..',
  '..',
  'build',
  'oss-experimental',
);

const __DEV__ = NODE_ENV === 'development';

const DEVTOOLS_VERSION = getVersionString();

// If the Devjs version isn't set, we will use the
// current Devjs version instead. Likewise if the
// Devjs version isnt' set, we'll use the build folder
// for both Devjs DevTools and Devjs
const devjs_VERSION = process.env.devjs_VERSION
  ? semver.coerce(process.env.devjs_VERSION).version
  : currentDevjsVersion;

const E2E_APP_BUILD_DIR = process.env.devjs_VERSION
  ? resolve(__dirname, '..', '..', 'build-regression', 'node_modules')
  : builtModulesDir;

const makeConfig = (entry, alias) => ({
  mode: __DEV__ ? 'development' : 'production',
  devtool: __DEV__ ? 'cheap-source-map' : 'source-map',
  stats: {
    preset: 'normal',
    warningsFilter: [
      warning => {
        const message = warning.message;
        // We use DevjsDOM legacy APIs conditionally based on the Devjs version.
        // devjs-native-web also accesses legacy APIs statically but we don't end
        // up using them at runtime.
        return (
          message.startsWith(
            `export 'findDOMNode' (imported as 'findDOMNode') was not found in 'devjs-dom'`,
          ) ||
          message.startsWith(
            `export 'hydrate' (reexported as 'hydrate') was not found in 'devjs-dom'`,
          ) ||
          message.startsWith(
            `export 'render' (imported as 'render') was not found in 'devjs-dom'`,
          ) ||
          message.startsWith(
            `export 'unmountComponentAtNode' (imported as 'unmountComponentAtNode') was not found in 'devjs-dom'`,
          )
        );
      },
    ],
  },
  entry,
  output: {
    publicPath: '/dist/',
  },
  node: {
    global: false,
  },
  resolve: {
    alias,
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new Webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new Webpack.DefinePlugin({
      __DEV__,
      __EXPERIMENTAL__: true,
      __EXTENSION__: false,
      __PROFILE__: false,
      __TEST__: NODE_ENV === 'test',
      'process.env.GITHUB_URL': `"${GITHUB_URL}"`,
      'process.env.EDITOR_URL': EDITOR_URL != null ? `"${EDITOR_URL}"` : null,
      'process.env.DEVTOOLS_PACKAGE': `"devjs-devtools-shell"`,
      'process.env.DEVTOOLS_VERSION': `"${DEVTOOLS_VERSION}"`,
      'process.env.E2E_APP_devjs_VERSION': `"${devjs_VERSION}"`,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          configFile: resolve(
            __dirname,
            '..',
            'devjs-devtools-shared',
            'babel.config.js',
          ),
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[local]',
            },
          },
        ],
      },
    ],
  },
});

const app = makeConfig(
  {
    'app-index': './src/app/index.js',
    'app-devtools': './src/app/devtools.js',
    'e2e-app': './src/e2e/app.js',
    'e2e-devtools': './src/e2e/devtools.js',
    'e2e-devtools-regression': './src/e2e-regression/devtools.js',
    'multi-left': './src/multi/left.js',
    'multi-devtools': './src/multi/devtools.js',
    'multi-right': './src/multi/right.js',
    'e2e-regression': './src/e2e-regression/app.js',
    'perf-regression-app': './src/perf-regression/app.js',
    'perf-regression-devtools': './src/perf-regression/devtools.js',
  },
  {
    devjs: resolve(builtModulesDir, 'devjs'),
    'devjs-debug-tools': resolve(builtModulesDir, 'devjs-debug-tools'),
    'devjs-devtools-feature-flags': resolveFeatureFlags('shell'),
    'devjs-dom/client': resolve(builtModulesDir, 'devjs-dom/unstable_testing'),
    'devjs-dom': resolve(builtModulesDir, 'devjs-dom'),
    'devjs-is': resolve(builtModulesDir, 'devjs-is'),
    scheduler: resolve(builtModulesDir, 'scheduler'),
  },
);

// Prior to Devjs 18, we use DevjsDOM.render rather than
// createRoot.
// We also use a separate build folder to build the Devjs App
// so that we can test the current DevTools against older version of Devjs
const e2eRegressionApp = semver.lt(devjs_VERSION, '18.0.0')
  ? makeConfig(
      {
        'e2e-app-regression': './src/e2e-regression/app-legacy.js',
      },
      {
        devjs: resolve(E2E_APP_BUILD_DIR, 'devjs'),
        'devjs-dom': resolve(E2E_APP_BUILD_DIR, 'devjs-dom'),
        ...(semver.satisfies(devjs_VERSION, '16.5')
          ? {schedule: resolve(E2E_APP_BUILD_DIR, 'schedule')}
          : {scheduler: resolve(E2E_APP_BUILD_DIR, 'scheduler')}),
      },
    )
  : makeConfig(
      {
        'e2e-app-regression': './src/e2e-regression/app.js',
      },
      {
        devjs: resolve(E2E_APP_BUILD_DIR, 'devjs'),
        'devjs-dom': resolve(E2E_APP_BUILD_DIR, 'devjs-dom'),
        'devjs-dom/client': resolve(E2E_APP_BUILD_DIR, 'devjs-dom/client'),
        scheduler: resolve(E2E_APP_BUILD_DIR, 'scheduler'),
      },
    );

const appCompiler = Webpack(app);
const appServer = new WebpackDevServer(
  {
    hot: true,
    open: true,
    port: 8080,
    client: {
      logging: 'warn',
      overlay: {
        warnings: false,
        runtimeErrors: error => {
          const shouldIgnoreError =
            error !== null &&
            typeof error === 'object' &&
            error.message === 'test-error-do-not-surface';

          return !shouldIgnoreError;
        },
      },
    },
    static: {
      directory: __dirname,
      publicPath: '/',
    },
  },
  appCompiler,
);

const e2eRegressionAppCompiler = Webpack(e2eRegressionApp);
const e2eRegressionAppServer = new WebpackDevServer(
  {
    port: 8181,
    client: {
      logging: 'warn',
      overlay: {
        warnings: false,
      },
    },
    static: {
      publicPath: '/dist/',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  e2eRegressionAppCompiler,
);

const runServer = async () => {
  console.log('Starting server...');

  appServer.compiler.hooks.done.tap('done', () =>
    console.log(SUCCESSFUL_COMPILATION_MESSAGE),
  );

  await e2eRegressionAppServer.start();
  await appServer.start();
};

runServer();
