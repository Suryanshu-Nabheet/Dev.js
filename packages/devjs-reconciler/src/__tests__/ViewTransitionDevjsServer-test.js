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

let act;
let ViewTransition;
let Devjs;
let DevjsServer;
let DevjsNoop;
let DevjsNoopFlightClient;
let DevjsNoopFlightServer;

describe('ViewTransitionDevjsServer', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.mock('devjs', () => require('devjs/devjs.devjs-server'));
    DevjsServer = require('devjs');
    ViewTransition = DevjsServer.ViewTransition;
    DevjsNoopFlightServer = require('devjs-noop-renderer/flight-server');

    jest.resetModules();
    __unmockDevjs();
    Devjs = require('devjs');
    DevjsNoopFlightClient = require('devjs-noop-renderer/flight-client');
    DevjsNoop = require('devjs-noop-renderer');
    const InternalTestUtils = require('internal-test-utils');
    act = InternalTestUtils.act;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // @gate enableViewTransition || fb
  it('can be rendered in Devjs Server', async () => {
    function App() {
      return DevjsServer.createElement(
        ViewTransition,
        {},
        DevjsServer.createElement('div', null, 'Hello, Dave!'),
      );
    }

    const transport = DevjsNoopFlightServer.render(
      DevjsServer.createElement(App, null),
    );

    await act(async () => {
      const app = await DevjsNoopFlightClient.read(transport);

      DevjsNoop.render(app);
    });

    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello, Dave!</div>);
  });
});
