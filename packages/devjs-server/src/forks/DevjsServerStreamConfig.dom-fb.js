/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export * from '../DevjsServerStreamConfigFB';

export function scheduleMicrotask(callback: () => void) {
  // We don't schedule work in this model, and instead expect performWork to always be called repeatedly.
}

export function scheduleWork(callback: () => void) {
  // We don't schedule work in this model, and instead expect performWork to always be called repeatedly.
}
