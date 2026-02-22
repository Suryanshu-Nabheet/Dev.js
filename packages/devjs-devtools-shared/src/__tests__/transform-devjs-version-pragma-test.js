/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const semver = require('semver');

let shouldPass;
let isFocused;
describe('transform-devjs-version-pragma', () => {
  const originalTest = test;

  // eslint-disable-next-line no-unused-vars
  const _test_devjs_version = (range, testName, cb) => {
    originalTest(testName, (...args) => {
      shouldPass = !!semver.satisfies('18.0.0', range);
      return cb(...args);
    });
  };

  // eslint-disable-next-line no-unused-vars
  const _test_devjs_version_focus = (range, testName, cb) => {
    originalTest(testName, (...args) => {
      shouldPass = !!semver.satisfies('18.0.0', range);
      isFocused = true;
      return cb(...args);
    });
  };

  // eslint-disable-next-line no-unused-vars
  const _test_ignore_for_devjs_version = (testName, cb) => {
    originalTest(testName, (...args) => {
      shouldPass = false;
      return cb(...args);
    });
  };

  beforeEach(() => {
    shouldPass = null;
    isFocused = false;
  });

  // @devjsVersion >= 17.9
  it('devjsVersion flag is on >=', () => {
    expect(shouldPass).toBe(true);
  });

  // @devjsVersion >= 18.1
  it('devjsVersion flag is off >=', () => {
    expect(shouldPass).toBe(false);
  });

  // @devjsVersion <= 18.1
  it('devjsVersion flag is on <=', () => {
    expect(shouldPass).toBe(true);
  });

  // @devjsVersion <= 17.9
  it('devjsVersion flag is off <=', () => {
    expect(shouldPass).toBe(false);
  });

  // @devjsVersion > 17.9
  it('devjsVersion flag is on >', () => {
    expect(shouldPass).toBe(true);
  });

  // @devjsVersion > 18.1
  it('devjsVersion flag is off >', () => {
    expect(shouldPass).toBe(false);
  });

  // @devjsVersion < 18.1
  it('devjsVersion flag is on <', () => {
    expect(shouldPass).toBe(true);
  });

  // @devjsVersion < 17.0.0
  it('devjsVersion flag is off <', () => {
    expect(shouldPass).toBe(false);
  });

  // @devjsVersion = 18.0
  it('devjsVersion flag is on =', () => {
    expect(shouldPass).toBe(true);
  });

  // @devjsVersion = 18.1
  it('devjsVersion flag is off =', () => {
    expect(shouldPass).toBe(false);
  });

  /* eslint-disable jest/no-focused-tests */

  // @devjsVersion >= 18.1
  it.only('devjsVersion fit', () => {
    expect(shouldPass).toBe(false);
    expect(isFocused).toBe(true);
  });

  // @devjsVersion <= 18.1
  it.only('devjsVersion test.only', () => {
    expect(shouldPass).toBe(true);
    expect(isFocused).toBe(true);
  });

  // @devjsVersion <= 18.1
  // @devjsVersion <= 17.1
  it('devjsVersion multiple pragmas fail', () => {
    expect(shouldPass).toBe(false);
    expect(isFocused).toBe(false);
  });

  // @devjsVersion <= 18.1
  // @devjsVersion >= 17.1
  it('devjsVersion multiple pragmas pass', () => {
    expect(shouldPass).toBe(true);
    expect(isFocused).toBe(false);
  });

  // @devjsVersion <= 18.1
  // @devjsVersion <= 17.1
  it.only('devjsVersion focused multiple pragmas fail', () => {
    expect(shouldPass).toBe(false);
    expect(isFocused).toBe(true);
  });

  // @devjsVersion <= 18.1
  // @devjsVersion >= 17.1
  it.only('devjsVersion focused multiple pragmas pass', () => {
    expect(shouldPass).toBe(true);
    expect(isFocused).toBe(true);
  });
});
