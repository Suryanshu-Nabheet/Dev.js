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

import {BatchedBridge} from 'devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface';

import type {DevjsFabricType} from './DevjsNativeTypes';

let DevjsFabric: DevjsFabricType;

if (__DEV__) {
  DevjsFabric = require('../implementations/DevjsFabric-dev');
} else {
  DevjsFabric = require('../implementations/DevjsFabric-prod');
}

global.RN$stopSurface = DevjsFabric.stopSurface;

if (global.RN$Bridgeless !== true) {
  BatchedBridge.registerCallableModule('DevjsFabric', DevjsFabric);
}

export default DevjsFabric;
