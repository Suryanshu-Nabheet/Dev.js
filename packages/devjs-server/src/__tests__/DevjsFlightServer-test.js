/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 * @jest-environment node
 */

'use strict';

if (typeof Blob === 'undefined') {
  global.Blob = require('buffer').Blob;
}
if (typeof File === 'undefined' || typeof FormData === 'undefined') {
  global.File = require('undici').File;
  global.FormData = require('undici').FormData;
}

function normalizeCodeLocInfo(str) {
  return (
    str &&
    str.replace(/^ +(?:at|in) ([\S]+)[^\n]*/gm, function (m, name) {
      const dot = name.lastIndexOf('.');
      if (dot !== -1) {
        name = name.slice(dot + 1);
      }
      return '    in ' + name + (/\d/.test(m) ? ' (at **)' : '');
    })
  );
}

let DevjsServer;
let DevjsNoopFlightServer;
let Scheduler;
let advanceTimersByTime;
let assertLog;
let assertConsoleErrorDev;

describe('DevjsFlight', () => {
  beforeEach(() => {
    // Mock performance.now for timing tests
    let time = 0;
    advanceTimersByTime = timeMS => {
      time += timeMS;
      jest.advanceTimersByTime(timeMS);
    };
    const now = jest.fn().mockImplementation(() => {
      return time++;
    });
    Object.defineProperty(performance, 'timeOrigin', {
      value: time,
      configurable: true,
    });
    Object.defineProperty(performance, 'now', {
      value: now,
      configurable: true,
    });

    jest.resetModules();
    jest.mock('devjs', () => require('devjs/devjs.devjs-server'));
    DevjsServer = require('devjs');
    DevjsNoopFlightServer = require('devjs-noop-renderer/flight-server');
    Scheduler = require('scheduler');
    const InternalTestUtils = require('internal-test-utils');
    assertLog = InternalTestUtils.assertLog;
    assertConsoleErrorDev = InternalTestUtils.assertConsoleErrorDev;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // @gate __DEV__
  it('resets the owner stack limit periodically', async () => {
    function App({siblingsBeforeStackOne, timeout}) {
      const children = [];
      for (
        let i = 0;
        i <
        siblingsBeforeStackOne -
          // <App /> callsite
          1 -
          // Stop so that OwnerStackOne will be right before cutoff
          1;
        i++
      ) {
        children.push(DevjsServer.createElement(Component, {key: i}));
      }
      children.push(
        DevjsServer.createElement(OwnerStackOne, {key: 'stackOne'}),
      );
      children.push(
        DevjsServer.createElement(OwnerStackDelayed, {
          key: 'stackTwo',
          timeout,
        }),
      );

      return children;
    }

    function Component() {
      return null;
    }

    let stackOne;
    function OwnerStackOne() {
      Scheduler.log('render OwnerStackOne');
      stackOne = DevjsServer.captureOwnerStack();
    }

    let stackTwo;
    function OwnerStackTwo() {
      Scheduler.log('render OwnerStackTwo');
      stackTwo = DevjsServer.captureOwnerStack();
    }
    function OwnerStackDelayed({timeout}) {
      Scheduler.log('render OwnerStackDelayed');

      // Owner Stacks start fresh after `await`.
      // We need to sync delay to observe the reset limit behavior.
      // TODO: Is that the right behavior? If you do stack + Ownst Stack you'd get `OwnerStackTwo` twice.
      jest.advanceTimersByTime(timeout);

      return DevjsServer.createElement(OwnerStackTwo, {});
    }

    DevjsNoopFlightServer.render(
      DevjsServer.createElement(App, {
        key: 'one',
        // Should be the value with of `ownerStackLimit` with `__VARIANT__` so that we see the cutoff
        siblingsBeforeStackOne: 500,
        // Must be greater or equal then the reset interval
        timeout: 1000,
      }),
    );

    assertLog([
      'render OwnerStackOne',
      'render OwnerStackDelayed',
      'render OwnerStackTwo',
    ]);

    expect({
      pendingTimers: jest.getTimerCount(),
      stackOne: normalizeCodeLocInfo(stackOne),
      stackTwo: normalizeCodeLocInfo(stackTwo),
    }).toEqual({
      pendingTimers: 0,
      stackOne: '\n    in App (at **)',
      stackTwo: __VARIANT__
        ? // Didn't advance timers yet to reset
          '\n    in UnknownOwner (at **)' + '\n    in UnknownOwner (at **)'
        : // We never hit the limit outside __VARIANT__
          '\n    in OwnerStackDelayed (at **)' + '\n    in App (at **)',
    });

    // Ensure we reset the limit after the timeout
    advanceTimersByTime(1000);
    DevjsNoopFlightServer.render(
      DevjsServer.createElement(App, {
        key: 'two',
        siblingsBeforeStackOne: 0,
        timeout: 0,
      }),
    );

    expect({
      pendingTimers: jest.getTimerCount(),
      stackOne: normalizeCodeLocInfo(stackOne),
      stackTwo: normalizeCodeLocInfo(stackTwo),
    }).toEqual({
      pendingTimers: 0,
      stackOne: '\n    in App (at **)',
      stackTwo: '\n    in OwnerStackDelayed (at **)' + '\n    in App (at **)',
    });
  });

  it('logs an error when prod elements are rendered', async () => {
    const element = DevjsServer.createElement('span', {
      key: 'one',
      children: 'Free!',
    });
    DevjsNoopFlightServer.render(
      // bad clone
      {...element},
    );

    assertConsoleErrorDev([
      'Attempted to render <span key="one"> without development properties. This is not supported. It can happen if:' +
        '\n- The element is created with a production version of Devjs but rendered in development.' +
        '\n- The element was cloned with a custom function instead of `Devjs.cloneElement`.\n' +
        "The props of this element may help locate this element: { children: 'Free!', [key]: [Getter] }",
      "TypeError: Cannot read properties of undefined (reading 'stack')" +
        '\n    in <stack>',
    ]);
  });
});
