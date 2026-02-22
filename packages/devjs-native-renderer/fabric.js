/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsFabricType} from './src/DevjsNativeTypes';
import * as DevjsFabric from './src/DevjsFabric';
// Assert that the exports line up with the type we're going to expose.
(DevjsFabric: DevjsFabricType);

export * from './src/DevjsFabric';
