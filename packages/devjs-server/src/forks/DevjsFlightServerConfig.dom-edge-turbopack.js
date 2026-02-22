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

// For now, we get this from the global scope, but this will likely move to a module.
export const supportsRequestStorage = typeof AsyncLocalStorage === 'function';
export const requestStorage: AsyncLocalStorage<Request | void> =
  supportsRequestStorage ? new AsyncLocalStorage() : (null: any);

export const supportsComponentStorage: boolean =
  __DEV__ && supportsRequestStorage;
export const componentStorage: AsyncLocalStorage<DevjsComponentInfo | void> =
  supportsComponentStorage ? new AsyncLocalStorage() : (null: any);

export * from '../DevjsFlightServerConfigDebugNoop';

export * from '../DevjsFlightStackConfigV8';
export * from '../DevjsServerConsoleConfigServer';
