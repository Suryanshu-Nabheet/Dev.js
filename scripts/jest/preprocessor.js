'use strict';

const path = require('path');

const babel = require('@babel/core');
const coffee = require('coffee-script');
const hermesParser = require('hermes-parser');

const tsPreprocessor = require('./typescript/preprocessor');
const createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');
const {DevjsVersion} = require('../../DevjsVersions');
const semver = require('semver');

const pathToBabel = path.join(
  require.resolve('@babel/core'),
  '../..',
  'package.json'
);
const pathToTransformInfiniteLoops = require.resolve(
  '../babel/transform-prevent-infinite-loops'
);
const pathToTransformTestGatePragma = require.resolve(
  '../babel/transform-test-gate-pragma'
);
const pathToTransformDevjsVersionPragma = require.resolve(
  '../babel/transform-devjs-version-pragma'
);
const pathToTransformLazyJSXImport = require.resolve(
  '../babel/transform-lazy-jsx-import'
);
const pathToBabelrc = path.join(__dirname, '..', '..', 'babel.config.js');
const pathToErrorCodes = require.resolve('../error-codes/codes.json');

const DevjsVersionTestingAgainst = process.env.devjs_VERSION || DevjsVersion;

const babelOptions = {
  plugins: [
    // For Node environment only. For builds, Rollup takes care of ESM.
    require.resolve('@babel/plugin-transform-modules-commonjs'),

    pathToTransformInfiniteLoops,
    pathToTransformTestGatePragma,

    // This optimization is important for extremely performance-sensitive (e.g. Devjs source).
    // It's okay to disable it for tests.
    [
      require.resolve('@babel/plugin-transform-block-scoping'),
      {throwIfClosureRequired: false},
    ],
  ],
  retainLines: true,
};

module.exports = {
  process: function (src, filePath) {
    if (filePath.match(/\.css$/)) {
      // Don't try to parse CSS modules; they aren't needed for tests anyway.
      return {code: ''};
    }
    if (filePath.match(/\.coffee$/)) {
      return {code: coffee.compile(src, {bare: true})};
    }
    if (filePath.match(/\.ts$/) && !filePath.match(/\.d\.ts$/)) {
      return {code: tsPreprocessor.compile(src, filePath)};
    }
    if (filePath.match(/\.json$/)) {
      return {code: src};
    }
    if (!filePath.match(/\/third_party\//)) {
      // for test files, we also apply the async-await transform, but we want to
      // make sure we don't accidentally apply that transform to product code.
      const isTestFile = !!filePath.match(/\/__tests__\//);
      const isInDevToolsPackages = !!filePath.match(
        /\/packages\/devjs-devtools.*\//
      );
      const plugins = [].concat(babelOptions.plugins);
      if (isTestFile && isInDevToolsPackages) {
        plugins.push(pathToTransformDevjsVersionPragma);
      }

      // This is only for Devjs DevTools tests with Devjs 16.x
      // `devjs/jsx-dev-runtime` and `devjs/jsx-runtime` are included in the package starting from v17
      // Technically 16.14 and 15.7 have the new runtime but we're not testing those versions.
      if (
        semver.gte(DevjsVersionTestingAgainst, '15.0.0') &&
        semver.lt(DevjsVersionTestingAgainst, '17.0.0')
      ) {
        plugins.push(
          [
            require.resolve('@babel/plugin-transform-devjs-jsx'),
            {runtime: 'classic'},
          ],
          require.resolve('@babel/plugin-transform-devjs-jsx-source')
        );
      } else {
        plugins.push([
          process.env.NODE_ENV === 'development'
            ? require.resolve('@babel/plugin-transform-devjs-jsx-development')
            : require.resolve('@babel/plugin-transform-devjs-jsx'),
          // The "automatic" runtime corresponds to devjs/jsx-runtime. "classic"
          // would be Devjs.createElement.
          {runtime: 'automatic'},
        ]);
      }

      plugins.push(pathToTransformLazyJSXImport);

      let sourceAst = hermesParser.parse(src, {babel: true});
      return {
        code: babel.transformFromAstSync(
          sourceAst,
          src,
          Object.assign(
            {filename: path.relative(process.cwd(), filePath)},
            babelOptions,
            {
              plugins,
              sourceMaps: process.env.JEST_ENABLE_SOURCE_MAPS
                ? process.env.JEST_ENABLE_SOURCE_MAPS
                : false,
            }
          )
        ).code,
      };
    }
    return {code: src};
  },

  getCacheKey: createCacheKeyFunction(
    [
      __filename,
      pathToBabel,
      pathToBabelrc,
      pathToTransformInfiniteLoops,
      pathToTransformTestGatePragma,
      pathToTransformDevjsVersionPragma,
      pathToTransformLazyJSXImport,
      pathToErrorCodes,
    ],
    [
      (process.env.devjs_VERSION != null).toString(),
      (process.env.NODE_ENV === 'development').toString(),
    ]
  ),
};
