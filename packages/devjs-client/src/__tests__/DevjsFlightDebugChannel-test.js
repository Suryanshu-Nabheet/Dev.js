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

let act;
let Devjs;
let DevjsNoop;
let DevjsNoopFlightServer;
let DevjsNoopFlightClient;
let getDebugInfo;

describe('DevjsFlight', () => {
  beforeEach(() => {
    // Mock performance.now for timing tests
    let time = 10;
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
    DevjsNoopFlightServer = require('devjs-noop-renderer/flight-server');
    // This stores the state so we need to preserve it
    const flightModules = require('devjs-noop-renderer/flight-modules');
    jest.resetModules();
    __unmockDevjs();
    jest.mock('devjs-noop-renderer/flight-modules', () => flightModules);
    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');
    DevjsNoopFlightClient = require('devjs-noop-renderer/flight-client');
    act = require('internal-test-utils').act;

    getDebugInfo = require('internal-test-utils').getDebugInfo.bind(null, {
      useV8Stack: true,
      ignoreRscStreamInfo: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // @gate __DEV__ && enableComponentPerformanceTrack
  it('can render deep but cut off JSX in debug info', async () => {
    function createDeepJSX(n) {
      if (n <= 0) {
        return null;
      }
      return <div>{createDeepJSX(n - 1)}</div>;
    }

    function ServerComponent(props) {
      return <div>not using props</div>;
    }

    const debugChannel = {onMessage(message) {}};

    const transport = DevjsNoopFlightServer.render(
      {
        root: (
          <ServerComponent>
            {createDeepJSX(100) /* deper than objectLimit */}
          </ServerComponent>
        ),
      },
      {debugChannel},
    );

    await act(async () => {
      const rootModel = await DevjsNoopFlightClient.read(transport, {
        debugChannel,
      });
      const root = rootModel.root;
      const children = getDebugInfo(root)[1].props.children;
      expect(children.type).toBe('div');
      expect(children.props.children.type).toBe('div');
      DevjsNoop.render(root);
    });

    expect(DevjsNoop).toMatchRenderedOutput(<div>not using props</div>);
  });
});
