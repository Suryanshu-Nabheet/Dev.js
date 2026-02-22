/**
 * Copyright (c) Suryanshu Nabheet and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

describe('DevjsDOMInDevjsServer', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.mock('devjs', () => require('devjs/devjs.devjs-server'));
  });

  it('can require devjs-dom', () => {
    // In RSC this will be aliased.
    require('devjs');
    require('devjs-dom');
  });
});
