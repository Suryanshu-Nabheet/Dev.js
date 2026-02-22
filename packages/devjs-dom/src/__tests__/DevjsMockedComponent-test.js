/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

let Devjs;
let DevjsDOMClient;
let act;

let MockedComponent;
let DevjsDOMServer;

describe('DevjsMockedComponent', () => {
  beforeEach(() => {
    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');
    DevjsDOMServer = require('devjs-dom/server');
    act = require('internal-test-utils').act;

    MockedComponent = class extends Devjs.Component {
      render() {
        throw new Error('Should not get here.');
      }
    };
    // This is close enough to what a Jest mock would give us.
    MockedComponent.prototype.render = jest.fn();
  });

  it('should allow a mocked component to be rendered', async () => {
    const container = document.createElement('container');
    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(<MockedComponent />);
    });
  });

  it('should allow a mocked component to be updated in dev', async () => {
    const container = document.createElement('container');
    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(<MockedComponent />);
    });
    await act(() => {
      root.render(<MockedComponent />);
    });
  });

  it('should allow a mocked component to be rendered in dev (SSR)', () => {
    DevjsDOMServer.renderToString(<MockedComponent />);
  });
});
