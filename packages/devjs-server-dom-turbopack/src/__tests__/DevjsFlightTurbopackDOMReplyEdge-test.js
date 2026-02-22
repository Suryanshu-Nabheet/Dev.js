/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 * @jest-environment ./scripts/jest/DevjsDOMServerIntegrationEnvironment
 */

'use strict';

let turbopackServerMap;
let DevjsServerDOMServer;
let DevjsServerDOMClient;

describe('DevjsFlightDOMTurbopackReply', () => {
  beforeEach(() => {
    jest.resetModules();
    // Simulate the condition resolution
    jest.mock('devjs', () => require('devjs/devjs.devjs-server'));
    jest.mock('devjs-server-dom-turbopack/server', () =>
      require('devjs-server-dom-turbopack/server.edge'),
    );
    const TurbopackMock = require('./utils/TurbopackMock');
    turbopackServerMap = TurbopackMock.turbopackServerMap;
    DevjsServerDOMServer = require('devjs-server-dom-turbopack/server.edge');
    jest.resetModules();
    DevjsServerDOMClient = require('devjs-server-dom-turbopack/client.edge');
  });

  it('can encode a reply', async () => {
    const body = await DevjsServerDOMClient.encodeReply({some: 'object'});
    const decoded = await DevjsServerDOMServer.decodeReply(
      body,
      turbopackServerMap,
    );

    expect(decoded).toEqual({some: 'object'});
  });
});
