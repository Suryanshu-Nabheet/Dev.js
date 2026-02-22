/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsNativeType} from './src/DevjsNativeTypes';
import * as DevjsNative from './src/DevjsNativeRenderer';
// Assert that the exports line up with the type we're going to expose.
(DevjsNative: DevjsNativeType);

// TODO: Delete the legacy renderer, only Fabric is used now.
export * from './src/DevjsNativeRenderer';
