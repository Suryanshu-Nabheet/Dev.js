'use strict';

/** @flow */

const semver = require('semver');
const config = require('../../playwright.config');
const {test} = require('@playwright/test');

function runOnlyForDevjsRange(range) {
  test.skip(
    !semver.satisfies(config.use.devjs_version, range),
    `This test requires a Devjs version of ${range} to run. ` +
      `The Devjs version you're using is ${config.use.devjs_version}`
  );
}

module.exports = {runOnlyForDevjsRange};
