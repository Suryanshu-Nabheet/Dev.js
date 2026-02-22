'use strict';

const baseConfig = require('./config.base');

module.exports = Object.assign({}, baseConfig, {
  modulePathIgnorePatterns: [
    ...baseConfig.modulePathIgnorePatterns,
    'packages/devjs-devtools-extensions',
    'packages/devjs-devtools-shared',
    'DevjsIncrementalPerf',
    'DevjsIncrementalUpdatesMinimalism',
    'DevjsIncrementalTriangle',
    'DevjsIncrementalReflection',
    'forwardRef',
  ],
  // RN configs should not run devjs-dom tests.
  // There are many other tests that use devjs-dom
  // and for those we will use the www entrypoint,
  // but those tests should be migrated to Noop renderer.
  testPathIgnorePatterns: [
    'node_modules',
    'packages/devjs-dom',
    'packages/devjs-server-dom-webpack',
  ],
  setupFiles: [
    ...baseConfig.setupFiles,
    require.resolve('./setupTests.xplat.js'),
    require.resolve('./setupHostConfigs.js'),
  ],
});
