/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const DevjsVersionSrc = fs.readFileSync(
  require.resolve('../../packages/shared/DevjsVersion')
);
const devjsVersion = /export default '([^']+)';/.exec(DevjsVersionSrc)[1];

const versions = {
  'packages/devjs/package.json': require('../../packages/devjs/package.json')
    .version,
  'packages/devjs-dom/package.json':
    require('../../packages/devjs-dom/package.json').version,
  'packages/devjs-test-renderer/package.json':
    require('../../packages/devjs-test-renderer/package.json').version,
  'packages/shared/DevjsVersion.js': devjsVersion,
};

let allVersionsMatch = true;
Object.keys(versions).forEach(function (name) {
  const version = versions[name];
  if (version !== devjsVersion) {
    allVersionsMatch = false;
    console.log(
      '%s version does not match package.json. Expected %s, saw %s.',
      name,
      devjsVersion,
      version
    );
  }
});

if (!allVersionsMatch) {
  process.exit(1);
}
