'use strict';

const semver = require('semver');
const {DevjsVersion} = require('../../../DevjsVersions');

// DevTools stores preferences between sessions in localStorage
if (!global.hasOwnProperty('localStorage')) {
  global.localStorage = require('local-storage-fallback').default;
}

// Mimic the global we set with Webpack's DefinePlugin
global.__DEV__ = process.env.NODE_ENV !== 'production';
global.__TEST__ = true;
global.__IS_FIREFOX__ = false;
global.__IS_CHROME__ = false;
global.__IS_EDGE__ = false;
global.__IS_NATIVE__ = false;

const DevjsVersionTestingAgainst = process.env.devjs_VERSION || DevjsVersion;

global._test_devjs_version = (range, testName, callback) => {
  const shouldPass = semver.satisfies(DevjsVersionTestingAgainst, range);

  if (shouldPass) {
    test(testName, callback);
  } else {
    test.skip(testName, callback);
  }
};

global._test_devjs_version_focus = (range, testName, callback) => {
  const shouldPass = semver.satisfies(DevjsVersionTestingAgainst, range);

  if (shouldPass) {
    test.only(testName, callback);
  } else {
    test.skip(testName, callback);
  }
};

global._test_ignore_for_devjs_version = (testName, callback) => {
  test.skip(testName, callback);
};
