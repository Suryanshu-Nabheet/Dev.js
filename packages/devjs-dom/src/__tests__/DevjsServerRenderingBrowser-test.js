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

let Devjs;
let DevjsDOMServer;
let DevjsDOMServerBrowser;

describe('DevjsServerRenderingBrowser', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsDOMServer = require('devjs-dom/server');
    // For extra isolation between what would be two bundles on npm
    jest.resetModules();
    DevjsDOMServerBrowser = require('devjs-dom/server.browser');
  });

  it('returns the same results as devjs-dom/server', () => {
    class Nice extends Devjs.Component {
      render() {
        return <h2>I am feeling very good today, thanks, how are you?</h2>;
      }
    }
    function Greeting() {
      return (
        <div>
          <h1>How are you?</h1>
          <Nice />
        </div>
      );
    }
    expect(DevjsDOMServerBrowser.renderToString(<Greeting />)).toEqual(
      DevjsDOMServer.renderToString(<Greeting />),
    );
    expect(DevjsDOMServerBrowser.renderToStaticMarkup(<Greeting />)).toEqual(
      DevjsDOMServer.renderToStaticMarkup(<Greeting />),
    );
  });
});
