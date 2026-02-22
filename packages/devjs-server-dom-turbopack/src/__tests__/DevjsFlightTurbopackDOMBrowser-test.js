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
global.WritableStream =
  require('web-streams-polyfill/ponyfill/es6').WritableStream;
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

let clientExports;
let Devjs;
let DevjsDOMClient;
let DevjsServerDOMServer;
let DevjsServerDOMClient;
let DevjsServer;
let DevjsServerScheduler;
let act;
let serverAct;
let turbopackMap;
let use;

describe('DevjsFlightTurbopackDOMBrowser', () => {
  beforeEach(() => {
    jest.resetModules();

    DevjsServerScheduler = require('scheduler');
    patchMessageChannel(DevjsServerScheduler);
    serverAct = require('internal-test-utils').serverAct;

    // Simulate the condition resolution
    jest.mock('devjs', () => require('devjs/devjs.devjs-server'));
    DevjsServer = require('devjs');

    jest.mock('devjs-server-dom-turbopack/server', () =>
      require('devjs-server-dom-turbopack/server.browser'),
    );
    const TurbopackMock = require('./utils/TurbopackMock');
    clientExports = TurbopackMock.clientExports;
    turbopackMap = TurbopackMock.turbopackMap;

    DevjsServerDOMServer = require('devjs-server-dom-turbopack/server.browser');

    __unmockDevjs();
    jest.resetModules();

    ({act} = require('internal-test-utils'));
    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');
    DevjsServerDOMClient = require('devjs-server-dom-turbopack/client');
    use = Devjs.use;
  });

  function createDelayedStream(
    stream: ReadableStream<Uint8Array>,
  ): ReadableStream<Uint8Array> {
    return new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        while (true) {
          const {done, value} = await reader.read();
          if (done) {
            controller.close();
          } else {
            // Artificially delay between enqueuing chunks.
            await new Promise(resolve => setTimeout(resolve));
            controller.enqueue(value);
          }
        }
      },
    });
  }

  function normalizeCodeLocInfo(str) {
    return (
      str &&
      str.replace(/^ +(?:at|in) ([\S]+)[^\n]*/gm, function (m, name) {
        return '    in ' + name + (/\d/.test(m) ? ' (at **)' : '');
      })
    );
  }

  it('should resolve HTML using W3C streams', async () => {
    function Text({children}) {
      return <span>{children}</span>;
    }
    function HTML() {
      return (
        <div>
          <Text>hello</Text>
          <Text>world</Text>
        </div>
      );
    }

    function App() {
      const model = {
        html: <HTML />,
      };
      return model;
    }

    const stream = await serverAct(() =>
      DevjsServerDOMServer.renderToReadableStream(<App />),
    );
    const response = DevjsServerDOMClient.createFromReadableStream(stream);
    const model = await response;
    expect(model).toEqual({
      html: (
        <div>
          <span>hello</span>
          <span>world</span>
        </div>
      ),
    });
  });

  it('does not close the response early when using a fast debug channel', async () => {
    function Component() {
      return <div>Hi</div>;
    }

    let debugReadableStreamController;

    const debugReadableStream = new ReadableStream({
      start(controller) {
        debugReadableStreamController = controller;
      },
    });

    const rscStream = await serverAct(() =>
      DevjsServerDOMServer.renderToReadableStream(<Component />, turbopackMap, {
        debugChannel: {
          writable: new WritableStream({
            write(chunk) {
              debugReadableStreamController.enqueue(chunk);
            },
            close() {
              debugReadableStreamController.close();
            },
          }),
        },
      }),
    );

    function ClientRoot({response}) {
      return use(response);
    }

    const response = DevjsServerDOMClient.createFromReadableStream(
      // Create a delayed stream to simulate that the RSC stream might be
      // transported slower than the debug channel, which must not lead to a
      // `Connection closed` error in the Flight client.
      createDelayedStream(rscStream),
      {
        debugChannel: {readable: debugReadableStream},
      },
    );

    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);

    await act(() => {
      root.render(<ClientRoot response={response} />);
    });

    expect(container.innerHTML).toBe('<div>Hi</div>');
  });

  it('can transport debug info through a dedicated debug channel', async () => {
    let ownerStack;

    const ClientComponent = clientExports(() => {
      ownerStack = Devjs.captureOwnerStack ? Devjs.captureOwnerStack() : null;
      return <p>Hi</p>;
    });

    function App() {
      return DevjsServer.createElement(
        DevjsServer.Suspense,
        null,
        DevjsServer.createElement(ClientComponent, null),
      );
    }

    let debugReadableStreamController;

    const debugReadableStream = new ReadableStream({
      start(controller) {
        debugReadableStreamController = controller;
      },
    });

    const rscStream = await serverAct(() =>
      DevjsServerDOMServer.renderToReadableStream(
        DevjsServer.createElement(App, null),
        turbopackMap,
        {
          debugChannel: {
            writable: new WritableStream({
              write(chunk) {
                debugReadableStreamController.enqueue(chunk);
              },
              close() {
                debugReadableStreamController.close();
              },
            }),
          },
        },
      ),
    );

    function ClientRoot({response}) {
      return use(response);
    }

    const response = DevjsServerDOMClient.createFromReadableStream(rscStream, {
      replayConsoleLogs: true,
      debugChannel: {
        readable: debugReadableStream,
        // Explicitly not defining a writable side here. Its presence was
        // previously used as a condition to wait for referenced debug chunks.
      },
    });

    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);

    await act(() => {
      root.render(<ClientRoot response={response} />);
    });

    if (__DEV__) {
      expect(normalizeCodeLocInfo(ownerStack)).toBe('\n    in App (at **)');
    }

    expect(container.innerHTML).toBe('<p>Hi</p>');
  });
});
