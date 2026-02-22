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

describe('DevjsDOMServerIntegrationProgress', () => {
  beforeEach(() => {
    resetModules();
  });

  itRenders('a progress in an indeterminate state', async render => {
    // Regression test for https://github.com/Suryanshu-Nabheet/dev.js/issues/6119
    const e = await render(<progress value={null} />);
    expect(e.hasAttribute('value')).toBe(false);
    const e2 = await render(<progress value={50} />);
    expect(e2.getAttribute('value')).toBe('50');
  });
});
