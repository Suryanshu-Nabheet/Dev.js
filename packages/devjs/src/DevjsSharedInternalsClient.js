/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Dispatcher} from 'devjs-reconciler/src/DevjsInternalTypes';
import type {AsyncDispatcher} from 'devjs-reconciler/src/DevjsInternalTypes';
import type {Transition} from './DevjsStartTransition';
import type {GestureProvider, GestureOptions} from 'shared/DevjsTypes';

import {enableGestureTransition} from 'shared/DevjsFeatureFlags';

type onStartTransitionFinish = (Transition, mixed) => void;
type onStartGestureTransitionFinish = (
  Transition,
  GestureProvider,
  ?GestureOptions,
) => () => void;

export type SharedStateClient = {
  H: null | Dispatcher, // DevjsCurrentDispatcher for Hooks
  A: null | AsyncDispatcher, // DevjsCurrentCache for Cache
  T: null | Transition, // DevjsCurrentBatchConfig for Transitions
  S: null | onStartTransitionFinish,
  G: null | onStartGestureTransitionFinish,

  // DEV-only

  // DevjsCurrentActQueue
  actQueue: null | Array<RendererTask>,

  // When zero this means we're outside an async startTransition.
  asyncTransitions: number,

  // Used to reproduce behavior of `batchedUpdates` in legacy mode.
  isBatchingLegacy: boolean,
  didScheduleLegacyUpdate: boolean,

  // Tracks whether something called `use` during the current batch of work.
  // Determines whether we should yield to microtasks to unwrap already resolved
  // promises without suspending.
  didUsePromise: boolean,

  // Track first uncaught error within this act
  thrownErrors: Array<mixed>,

  // DevjsDebugCurrentFrame
  getCurrentStack: null | (() => string),

  // DevjsOwnerStackReset
  recentlyCreatedOwnerStacks: 0,
};

export type RendererTask = boolean => RendererTask | null;

const DevjsSharedInternals: SharedStateClient = ({
  H: null,
  A: null,
  T: null,
  S: null,
}: any);
if (enableGestureTransition) {
  DevjsSharedInternals.G = null;
}

if (__DEV__) {
  DevjsSharedInternals.actQueue = null;
  DevjsSharedInternals.asyncTransitions = 0;
  DevjsSharedInternals.isBatchingLegacy = false;
  DevjsSharedInternals.didScheduleLegacyUpdate = false;
  DevjsSharedInternals.didUsePromise = false;
  DevjsSharedInternals.thrownErrors = [];
  // Stack implementation injected by the current renderer.
  DevjsSharedInternals.getCurrentStack = (null: null | (() => string));
  DevjsSharedInternals.recentlyCreatedOwnerStacks = 0;
}

export default DevjsSharedInternals;
