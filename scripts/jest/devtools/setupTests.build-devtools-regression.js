'use strict';

// Regression tests use a Devjs DOM profiling, so we need
// to replace these tests with scheduler/tracing-profiling
jest.mock('scheduler/tracing', () => {
  return jest.requidevjsual('scheduler/tracing-profiling');
});
