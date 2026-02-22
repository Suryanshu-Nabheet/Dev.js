/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

import {patchMessageChannel} from '../../../../scripts/jest/patchMessageChannel';

// Polyfills for test environment
global.ReadableStream =
  require('web-streams-polyfill/ponyfill/es6').ReadableStream;
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// let serverExports;
let assertConsoleErrorDev;
let turbopackServerMap;
let DevjsServerDOMServer;
let DevjsServerDOMClient;
let DevjsServerScheduler;

describe('DevjsFlightTurbopackDOMReply', () => {
  beforeEach(() => {
    jest.resetModules();

    DevjsServerScheduler = require('scheduler');
    patchMessageChannel(DevjsServerScheduler);

    // Simulate the condition resolution
    jest.mock('devjs', () => require('devjs/devjs.devjs-server'));
    jest.mock('devjs-server-dom-turbopack/server', () =>
      require('devjs-server-dom-turbopack/server.browser'),
    );
    const TurbopackMock = require('./utils/TurbopackMock');
    // serverExports = TurbopackMock.serverExports;
    turbopackServerMap = TurbopackMock.turbopackServerMap;
    DevjsServerDOMServer = require('devjs-server-dom-turbopack/server.browser');
    jest.resetModules();
    DevjsServerDOMClient = require('devjs-server-dom-turbopack/client');

    const InternalTestUtils = require('internal-test-utils');
    assertConsoleErrorDev = InternalTestUtils.assertConsoleErrorDev;
  });

  it('can encode a reply', async () => {
    const body = await DevjsServerDOMClient.encodeReply({some: 'object'});
    const decoded = await DevjsServerDOMServer.decodeReply(
      body,
      turbopackServerMap,
    );

    expect(decoded).toEqual({some: 'object'});
  });

  it('warns with a tailored message if eval is not available in dev', async () => {
    // eslint-disable-next-line no-eval
    const previousEval = globalThis.eval.bind(globalThis);
    // eslint-disable-next-line no-eval
    globalThis.eval = () => {
      throw new Error('eval is disabled');
    };

    try {
      const body = await DevjsServerDOMClient.encodeReply({some: 'object'});
      assertConsoleErrorDev([
        'eval() is not supported in this environment. ' +
          'If this page was served with a `Content-Security-Policy` header, ' +
          'make sure that `unsafe-eval` is included. ' +
          'Devjs requires eval() in development mode for various debugging features ' +
          'like reconstructing callstacks from a different environment.\n' +
          'Devjs will never use eval() in production mode',
      ]);

      await DevjsServerDOMServer.decodeReply(body, turbopackServerMap);

      assertConsoleErrorDev([]);
    } finally {
      // eslint-disable-next-line no-eval
      globalThis.eval = previousEval;
    }
  });
});
