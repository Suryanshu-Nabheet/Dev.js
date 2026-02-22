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

let createDevjsNativeComponentClass;

describe('DevjsNativeError', () => {
  beforeEach(() => {
    jest.resetModules();

    createDevjsNativeComponentClass =
      require('devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface')
        .DevjsNativeViewConfigRegistry.register;
  });

  it('should throw error if null component registration getter is used', () => {
    expect(() => {
      try {
        createDevjsNativeComponentClass('View', null);
      } catch (e) {
        throw new Error(e.toString());
      }
    }).toThrow(
      'View config getter callback for component `View` must be a function (received `null`)',
    );
  });
});
