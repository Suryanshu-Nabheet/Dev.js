/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Request} from 'devjs-server/src/DevjsFlightServer';
import type {DevjsComponentInfo} from 'shared/DevjsTypes';

export * from 'devjs-server-dom-turbopack/src/server/DevjsFlightServerConfigTurbopackBundler';
export * from 'devjs-dom-bindings/src/server/DevjsFlightServerConfigDOM';

export const supportsRequestStorage = false;
export const requestStorage: AsyncLocalStorage<Request | void> = (null: any);

export const supportsComponentStorage = false;
export const componentStorage: AsyncLocalStorage<DevjsComponentInfo | void> =
  (null: any);

export * from '../DevjsFlightServerConfigDebugNoop';

export * from '../DevjsFlightStackConfigV8';
export * from '../DevjsServerConsoleConfigBrowser';
