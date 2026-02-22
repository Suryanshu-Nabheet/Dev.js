'use strict';

const JestDevjs = require('jest-devjs');
const {assertConsoleLogsCleared} = require('internal-test-utils/consoleMock');
// TODO: Move to DevjsInternalTestUtils

function captureAssertion(fn) {
  // Trick to use a Jest matcher inside another Jest matcher. `fn` contains an
  // assertion; if it throws, we capture the error and return it, so the stack
  // trace presented to the user points to the original assertion in the
  // test file.
  try {
    fn();
  } catch (error) {
    return {
      pass: false,
      message: () => error.message,
    };
  }
  return {pass: true};
}

function assertYieldsWereCleared(Scheduler, caller) {
  const actualYields = Scheduler.unstable_clearLog();
  if (actualYields.length !== 0) {
    const error = Error(
      'The event log is not empty. Call assertLog(...) first.'
    );
    Error.captureStackTrace(error, caller);
    throw error;
  }
  assertConsoleLogsCleared();
}

function toMatchRenderedOutput(DevjsNoop, expectedJSX) {
  if (typeof DevjsNoop.getChildrenAsJSX === 'function') {
    const Scheduler = DevjsNoop._Scheduler;
    assertYieldsWereCleared(Scheduler, toMatchRenderedOutput);
    return captureAssertion(() => {
      expect(DevjsNoop.getChildrenAsJSX()).toEqual(expectedJSX);
    });
  }
  return JestDevjs.unstable_toMatchRenderedOutput(DevjsNoop, expectedJSX);
}

module.exports = {
  toMatchRenderedOutput,
};
