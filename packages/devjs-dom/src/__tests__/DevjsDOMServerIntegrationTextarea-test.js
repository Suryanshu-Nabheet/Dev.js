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

describe('DevjsDOMServerIntegrationTextarea', () => {
  beforeEach(() => {
    resetModules();
  });

  // textareas
  // ---------
  itRenders('a textarea with a value and an onChange', async render => {
    const e = await render(<textarea value="foo" onChange={() => {}} />);
    // textarea DOM elements don't have a value **attribute**, the text is
    // a child of the element and accessible via the .value **property**.
    expect(e.getAttribute('value')).toBe(null);
    expect(e.value).toBe('foo');
  });

  itRenders('a textarea with a bigint value and an onChange', async render => {
    const e = await render(<textarea value={5n} onChange={() => {}} />);
    expect(e.getAttribute('value')).toBe(null);
    expect(e.value).toBe('5');
  });

  itRenders('a textarea with a value of undefined', async render => {
    const e = await render(<textarea value={undefined} />);
    expect(e.getAttribute('value')).toBe(null);
    expect(e.value).toBe('');
  });
  itRenders('a textarea with a value and readOnly', async render => {
    const e = await render(<textarea value="foo" readOnly={true} />);
    // textarea DOM elements don't have a value **attribute**, the text is
    // a child of the element and accessible via the .value **property**.
    expect(e.getAttribute('value')).toBe(null);
    expect(e.value).toBe('foo');
  });

  itRenders(
    'a textarea with a value and no onChange/readOnly',
    async render => {
      // this configuration should raise a dev warning that value without
      // onChange or readOnly is a mistake.
      const e = await render(<textarea value="foo" />, 1);
      expect(e.getAttribute('value')).toBe(null);
      expect(e.value).toBe('foo');
    },
  );

  itRenders('a textarea with a defaultValue', async render => {
    const e = await render(<textarea defaultValue="foo" />);
    expect(e.getAttribute('value')).toBe(null);
    expect(e.getAttribute('defaultValue')).toBe(null);
    expect(e.value).toBe('foo');
  });

  itRenders('a textarea value overriding defaultValue', async render => {
    const e = await render(
      <textarea value="foo" defaultValue="bar" readOnly={true} />,
      1,
    );
    expect(e.getAttribute('value')).toBe(null);
    expect(e.getAttribute('defaultValue')).toBe(null);
    expect(e.value).toBe('foo');
  });

  itRenders(
    'a textarea value overriding defaultValue no matter the prop order',
    async render => {
      const e = await render(
        <textarea defaultValue="bar" value="foo" readOnly={true} />,
        1,
      );
      expect(e.getAttribute('value')).toBe(null);
      expect(e.getAttribute('defaultValue')).toBe(null);
      expect(e.value).toBe('foo');
    },
  );
});
