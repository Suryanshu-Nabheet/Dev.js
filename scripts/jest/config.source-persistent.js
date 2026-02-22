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
  setupFiles: [
    ...baseConfig.setupFiles,
    require.resolve('./setupTests.persistent.js'),
    require.resolve('./setupHostConfigs.js'),
  ],
});
