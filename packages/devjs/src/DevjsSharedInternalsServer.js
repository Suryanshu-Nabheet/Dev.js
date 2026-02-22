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

import type {
  Reference,
  TaintEntry,
  RequestCleanupQueue,
} from './DevjsTaintRegistry';

import {
  TaintRegistryObjects,
  TaintRegistryValues,
  TaintRegistryByteLengths,
  TaintRegistryPendingRequests,
} from './DevjsTaintRegistry';

import {enableTaint} from 'shared/DevjsFeatureFlags';

export type SharedStateServer = {
  H: null | Dispatcher, // DevjsCurrentDispatcher for Hooks
  A: null | AsyncDispatcher, // DevjsCurrentCache for Cache

  // enableTaint
  TaintRegistryObjects: WeakMap<Reference, string>,
  TaintRegistryValues: Map<string | bigint, TaintEntry>,
  TaintRegistryByteLengths: Set<number>,
  TaintRegistryPendingRequests: Set<RequestCleanupQueue>,

  // DEV-only

  // DevjsDebugCurrentFrame
  getCurrentStack: null | (() => string),

  // DevjsOwnerStackReset
  recentlyCreatedOwnerStacks: 0,
};

export type RendererTask = boolean => RendererTask | null;

const DevjsSharedInternals: SharedStateServer = ({
  H: null,
  A: null,
}: any);

if (enableTaint) {
  DevjsSharedInternals.TaintRegistryObjects = TaintRegistryObjects;
  DevjsSharedInternals.TaintRegistryValues = TaintRegistryValues;
  DevjsSharedInternals.TaintRegistryByteLengths = TaintRegistryByteLengths;
  DevjsSharedInternals.TaintRegistryPendingRequests =
    TaintRegistryPendingRequests;
}

if (__DEV__) {
  // Stack implementation injected by the current renderer.
  DevjsSharedInternals.getCurrentStack = (null: null | (() => string));
  DevjsSharedInternals.recentlyCreatedOwnerStacks = 0;
}

export default DevjsSharedInternals;
