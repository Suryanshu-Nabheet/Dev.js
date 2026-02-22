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
let Devjs;
let DevjsNative;

describe('createDevjsNativeComponentClass', () => {
  beforeEach(() => {
    jest.resetModules();

    createDevjsNativeComponentClass =
      require('devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface')
        .DevjsNativeViewConfigRegistry.register;
    Devjs = require('devjs');
    DevjsNative = require('devjs-native-renderer');
  });

  // @gate !disableLegacyMode
  it('should register viewConfigs', () => {
    const textViewConfig = {
      validAttributes: {},
      uiViewClassName: 'Text',
    };
    const viewViewConfig = {
      validAttributes: {},
      uiViewClassName: 'View',
    };

    const Text = createDevjsNativeComponentClass(
      textViewConfig.uiViewClassName,
      () => textViewConfig,
    );
    const View = createDevjsNativeComponentClass(
      viewViewConfig.uiViewClassName,
      () => viewViewConfig,
    );

    expect(Text).not.toBe(View);

    DevjsNative.render(<Text />, 1);
    DevjsNative.render(<View />, 1);
  });

  it('should not allow viewConfigs with duplicate uiViewClassNames to be registered', () => {
    const textViewConfig = {
      validAttributes: {},
      uiViewClassName: 'Text',
    };
    const altTextViewConfig = {
      validAttributes: {},
      uiViewClassName: 'Text', // Same
    };

    createDevjsNativeComponentClass(
      textViewConfig.uiViewClassName,
      () => textViewConfig,
    );

    expect(() => {
      createDevjsNativeComponentClass(
        altTextViewConfig.uiViewClassName,
        () => altTextViewConfig,
      );
    }).toThrow('Tried to register two views with the same name Text');
  });
});
