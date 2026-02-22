/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {ActivityInstance} from './DevjsFiberConfig';
import type {CapturedValue} from './DevjsCapturedValue';
import type {Lane} from './DevjsFiberLane';
import type {TreeContext} from './DevjsFiberTreeContext';

// A non-null ActivityState represents a dehydrated Activity boundary.
export type ActivityState = {
  dehydrated: ActivityInstance,
  treeContext: null | TreeContext,
  // Represents the lane we should attempt to hydrate a dehydrated boundary at.
  // OffscreenLane is the default for dehydrated boundaries.
  // NoLane is the default for normal boundaries, which turns into "normal" pri.
  retryLane: Lane,
  // Stashed Errors that happened while attempting to hydrate this boundary.
  hydrationErrors: Array<CapturedValue<mixed>> | null,
};
