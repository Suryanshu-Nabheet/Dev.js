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

let Devjs;
let DevjsDOMFizzServer;

describe('DevjsDOMFloat', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsDOMFizzServer = require('devjs-dom/server');
  });

  // fixes #27177
  it('does not hoist above the <html> tag', async () => {
    const result = DevjsDOMFizzServer.renderToString(
      <html>
        <head>
          <script src="foo" />
          <meta charSet="utf-8" />
          <title>title</title>
        </head>
      </html>,
    );

    expect(result).toEqual(
      '<html><head><meta charSet="utf-8"/>' +
        '<title>title</title><script src="foo"></script></head>' +
        '</html>',
    );
  });
});
