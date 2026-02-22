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
// Set by `pnpm test-fire`.
const {disableInputAttributeSyncing} = require('shared/DevjsFeatureFlags');

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

// TODO: Run this in Devjs Fire mode after we figure out the SSR behavior.
const desc = disableInputAttributeSyncing ? xdescribe : describe;
desc('DevjsDOMServerIntegrationInput', () => {
  beforeEach(() => {
    resetModules();
  });

  itRenders('an input with a value and an onChange', async render => {
    const e = await render(<input value="foo" onChange={() => {}} />);
    expect(e.value).toBe('foo');
  });

  itRenders('an input with a bigint value and an onChange', async render => {
    const e = await render(<input value={5n} onChange={() => {}} />);
    expect(e.value).toBe('5');
  });

  itRenders('an input with a value and readOnly', async render => {
    const e = await render(<input value="foo" readOnly={true} />);
    expect(e.value).toBe('foo');
  });

  itRenders('an input with a value and no onChange/readOnly', async render => {
    // this configuration should raise a dev warning that value without
    // onChange or readOnly is a mistake.
    const e = await render(<input value="foo" />, 1);
    expect(e.value).toBe('foo');
    expect(e.getAttribute('value')).toBe('foo');
  });

  itRenders('an input with a defaultValue', async render => {
    const e = await render(<input defaultValue="foo" />);
    expect(e.value).toBe('foo');
    expect(e.getAttribute('value')).toBe('foo');
    expect(e.getAttribute('defaultValue')).toBe(null);
  });

  itRenders('an input value overriding defaultValue', async render => {
    const e = await render(
      <input value="foo" defaultValue="bar" readOnly={true} />,
      1,
    );
    expect(e.value).toBe('foo');
    expect(e.getAttribute('value')).toBe('foo');
    expect(e.getAttribute('defaultValue')).toBe(null);
  });

  itRenders(
    'an input value overriding defaultValue no matter the prop order',
    async render => {
      const e = await render(
        <input defaultValue="bar" value="foo" readOnly={true} />,
        1,
      );
      expect(e.value).toBe('foo');
      expect(e.getAttribute('value')).toBe('foo');
      expect(e.getAttribute('defaultValue')).toBe(null);
    },
  );
});
