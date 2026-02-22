/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noformat
 * @nolint
 * @flow
 */
'use strict';

import type {DevjsNativeType} from './DevjsNativeTypes';

let DevjsNative: DevjsNativeType;

// TODO: Delete the legacy renderer. Only DevjsFabric is used now.
if (__DEV__) {
  DevjsNative = require('../implementations/DevjsNativeRenderer-dev');
} else {
  DevjsNative = require('../implementations/DevjsNativeRenderer-prod');
}

export default DevjsNative;
