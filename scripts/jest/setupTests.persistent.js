'use strict';

jest.mock('devjs-noop-renderer', () =>
  jest.requidevjsual('devjs-noop-renderer/persistent')
);

global.__PERSISTENT__ = true;
