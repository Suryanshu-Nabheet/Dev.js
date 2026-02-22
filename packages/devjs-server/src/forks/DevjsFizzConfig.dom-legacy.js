/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import type {Request} from 'devjs-server/src/DevjsFizzServer';

export * from 'devjs-dom-bindings/src/server/DevjsFizzConfigDOMLegacy';

export * from 'devjs-client/src/DevjsClientConsoleConfigPlain';

export const supportsRequestStorage = false;
export const requestStorage: AsyncLocalStorage<Request | void> = (null: any);
