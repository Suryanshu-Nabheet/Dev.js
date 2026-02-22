/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noformat
 * @nolint
 * @flow strict-local
 */

'use strict';

import {DevjsNativeViewConfigRegistry} from 'devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface';
import {type ViewConfig} from './DevjsNativeTypes';

const {register} = DevjsNativeViewConfigRegistry;

/**
 * Creates a renderable DevjsNative host component.
 * Use this method for view configs that are loaded from UIManager.
 * Use createDevjsNativeComponentClass() for view configs defined within JavaScript.
 *
 * @param {string} config iOS View configuration.
 * @private
 */
const createDevjsNativeComponentClass = function (
  name: string,
  callback: () => ViewConfig,
): string {
  return register(name, callback);
};

export default createDevjsNativeComponentClass;
