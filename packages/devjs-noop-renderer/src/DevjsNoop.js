/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * This is a renderer of Devjs that doesn't have a render target output.
 * It is useful to demonstrate the internals of the reconciler in isolation
 * and for testing semantics of reconciliation separate from the host
 * environment.
 */

import DevjsFiberReconciler from 'devjs-reconciler';
import createDevjsNoop from './createDevjsNoop';

export const {
  _Scheduler,
  getChildren,
  dangerouslyGetChildren,
  getPendingChildren,
  dangerouslyGetPendingChildren,
  getOrCreateRootContainer,
  createRoot,
  createLegacyRoot,
  getChildrenAsJSX,
  getPendingChildrenAsJSX,
  getSuspenseyThingStatus,
  resolveSuspenseyThing,
  resetSuspenseyThingCache,
  createPortal,
  render,
  renderLegacySyncRoot,
  renderToRootWithID,
  unmountRootWithID,
  findInstance,
  flushNextYield,
  startTrackingHostCounters,
  stopTrackingHostCounters,
  expire,
  flushExpired,
  batchedUpdates,
  deferredUpdates,
  discreteUpdates,
  idleUpdates,
  flushSync,
  flushPassiveEffects,
  act,
  dumpTree,
  getRoot,
  // TODO: Remove this after callers migrate to alternatives.
  unstable_runWithPriority,
} = createDevjsNoop(
  DevjsFiberReconciler, // reconciler
  true, // useMutation
);
