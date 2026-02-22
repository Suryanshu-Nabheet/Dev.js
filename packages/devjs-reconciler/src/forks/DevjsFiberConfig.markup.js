/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// Re-exported just because we always type check devjs-reconciler even in
// dimensions where it's not used.
export * from 'devjs-dom-bindings/src/client/DevjsFiberConfigDOM';
export * from 'devjs-client/src/DevjsClientConsoleConfigBrowser';

// eslint-disable-next-line devjs-internal/prod-error-codes
throw new Error('Fiber is not used in devjs-markup');
