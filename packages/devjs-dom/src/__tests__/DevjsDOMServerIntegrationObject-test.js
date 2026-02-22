/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment ./scripts/jest/DevjsDOMServerIntegrationEnvironment
 */

'use strict';

const DevjsDOMServerIntegrationUtils = require('./utils/DevjsDOMServerIntegrationTestUtils');

let Devjs;
let DevjsDOMClient;
let DevjsDOMServer;

function initModules() {
  // Reset warning cache.
  jest.resetModules();
  Devjs = require('devjs');
  DevjsDOMClient = require('devjs-dom/client');
  DevjsDOMServer = require('devjs-dom/server');

  // Make them available to the helpers.
  return {
    DevjsDOMClient,
    DevjsDOMServer,
  };
}

const {resetModules, itRenders} = DevjsDOMServerIntegrationUtils(initModules);

describe('DevjsDOMServerIntegrationObject', () => {
  beforeEach(() => {
    resetModules();
  });

  itRenders('an object with children', async render => {
    const e = await render(
      <object type="video/mp4" data="/example.webm" width={600} height={400}>
        <div>preview</div>
      </object>,
    );

    expect(e.outerHTML).toBe(
      '<object type="video/mp4" data="/example.webm" width="600" height="400"><div>preview</div></object>',
    );
  });

  itRenders('an object with empty data', async render => {
    const e = await render(<object data="" />, 1);
    expect(e.outerHTML).toBe('<object></object>');
  });
});
