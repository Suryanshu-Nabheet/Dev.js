#!/usr/bin/env node

'use strict';

const {logPromise, updateVersionsForNext} = require('../utils');
const theme = require('../theme');

module.exports = async ({devjsVersion, tempDirectory, version}) => {
  return logPromise(
    updateVersionsForNext(tempDirectory, devjsVersion, version),
    theme`Updating version numbers ({version ${version}})`
  );
};
