/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {AsyncLocalStorage} from 'async_hooks';

import type {Request} from 'devjs-server/src/DevjsFlightServer';
import type {DevjsComponentInfo} from 'shared/DevjsTypes';

export * from 'devjs-server-dom-webpack/src/server/DevjsFlightServerConfigWebpackBundler';
export * from 'devjs-dom-bindings/src/server/DevjsFlightServerConfigDOM';

export const supportsRequestStorage = true;
export const requestStorage: AsyncLocalStorage<Request | void> =
  new AsyncLocalStorage();

export const supportsComponentStorage = __DEV__;
export const componentStorage: AsyncLocalStorage<DevjsComponentInfo | void> =
  supportsComponentStorage ? new AsyncLocalStorage() : (null: any);

export * from '../DevjsFlightServerConfigDebugNode';

export * from '../DevjsFlightStackConfigV8';
export * from '../DevjsServerConsoleConfigServer';
