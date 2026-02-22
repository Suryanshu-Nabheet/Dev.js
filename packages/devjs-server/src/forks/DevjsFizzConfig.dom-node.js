/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {AsyncLocalStorage} from 'async_hooks';

import type {Request} from 'devjs-server/src/DevjsFizzServer';

export * from 'devjs-dom-bindings/src/server/DevjsFizzConfigDOM';

export * from 'devjs-client/src/DevjsClientConsoleConfigServer';

export const supportsRequestStorage = true;
export const requestStorage: AsyncLocalStorage<Request | void> =
  new AsyncLocalStorage();
