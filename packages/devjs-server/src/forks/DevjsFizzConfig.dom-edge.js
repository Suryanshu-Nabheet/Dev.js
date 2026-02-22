/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import type {Request} from 'devjs-server/src/DevjsFizzServer';

export * from 'devjs-dom-bindings/src/server/DevjsFizzConfigDOM';

export * from 'devjs-client/src/DevjsClientConsoleConfigServer';

// For now, we get this from the global scope, but this will likely move to a module.
export const supportsRequestStorage = typeof AsyncLocalStorage === 'function';
export const requestStorage: AsyncLocalStorage<Request | void> =
  supportsRequestStorage ? new AsyncLocalStorage() : (null: any);
