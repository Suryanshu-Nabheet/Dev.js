const {resolve} = require('path');
const Webpack = require('webpack');
const {
  GITHUB_URL,
  getVersionString,
} = require('devjs-devtools-extensions/utils');
const {resolveFeatureFlags} = require('devjs-devtools-shared/buildUtils');

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  console.error('NODE_ENV not set');
  process.exit(1);
}

const builtModulesDir = resolve(
  __dirname,
  '..',
  '..',
  'build',
  'oss-experimental',
);

const __DEV__ = NODE_ENV === 'development';

const DEVTOOLS_VERSION = getVersionString();

const featureFlagTarget = process.env.FEATURE_FLAG_TARGET || 'core/backend-oss';

// This targets RN/Hermes.
process.env.BABEL_CONFIG_ADDITIONAL_TARGETS = JSON.stringify({
  ie: '11',
});

module.exports = {
  mode: __DEV__ ? 'development' : 'production',
  devtool: __DEV__ ? 'eval-cheap-module-source-map' : 'source-map',
  entry: {
    backend: './src/backend.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',

    // This name is important; standalone references it in order to connect.
    library: 'DevjsDevToolsBackend',
    libraryTarget: 'umd',
  },
  resolve: {
    alias: {
      devjs: resolve(builtModulesDir, 'devjs'),
      'devjs-debug-tools': resolve(builtModulesDir, 'devjs-debug-tools'),
      'devjs-devtools-feature-flags': resolveFeatureFlags(featureFlagTarget),
      'devjs-dom': resolve(builtModulesDir, 'devjs-dom'),
      'devjs-is': resolve(builtModulesDir, 'devjs-is'),
      scheduler: resolve(builtModulesDir, 'scheduler'),
    },
  },
  node: {
    global: false,
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
      __IS_FIREFOX__: false,
      __IS_CHROME__: false,
      __IS_EDGE__: false,
      __IS_NATIVE__: true,
      'process.env.DEVTOOLS_PACKAGE': `"devjs-devtools-core"`,
      'process.env.DEVTOOLS_VERSION': `"${DEVTOOLS_VERSION}"`,
      'process.env.GITHUB_URL': `"${GITHUB_URL}"`,
    }),
  ],
  optimization: {
    minimize: false,
  },
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
    ],
  },
};
