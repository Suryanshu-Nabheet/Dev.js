/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

describe('shallow', () => {
  it('throws an error on init', () => {
    const DevjsShallowRenderer = require('../shallow.js').default;
    expect(() => {
      // eslint-disable-next-line no-new
      new DevjsShallowRenderer();
    }).toThrow(
      'devjs-test-renderer/shallow has been removed. See https://devjs.dev/warnings/devjs-test-renderer.'
    );
  });
});
