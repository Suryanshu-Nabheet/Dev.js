/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Task} from './DevjsFizzServer';

// DEV-only global reference to the currently executing task
export let currentTaskInDEV: null | Task = null;

export function setCurrentTaskInDEV(task: null | Task): void {
  if (__DEV__) {
    currentTaskInDEV = task;
  }
}
