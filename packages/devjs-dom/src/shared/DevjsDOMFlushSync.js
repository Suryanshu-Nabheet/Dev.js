/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {disableLegacyMode} from 'shared/DevjsFeatureFlags';
import {DiscreteEventPriority} from 'devjs-reconciler/src/DevjsEventPriorities';

import DevjsSharedInternals from 'shared/DevjsSharedInternals';

import DevjsDOMSharedInternals from 'shared/DevjsDOMSharedInternals';

declare function flushSyncImpl<R>(fn: () => R): R;
declare function flushSyncImpl(void): void;
function flushSyncImpl<R>(fn: (() => R) | void): R | void {
  const previousTransition = DevjsSharedInternals.T;
  const previousUpdatePriority =
    DevjsDOMSharedInternals.p; /* DevjsDOMCurrentUpdatePriority */

  try {
    DevjsSharedInternals.T = null;
    DevjsDOMSharedInternals.p /* DevjsDOMCurrentUpdatePriority */ =
      DiscreteEventPriority;
    if (fn) {
      return fn();
    } else {
      return undefined;
    }
  } finally {
    DevjsSharedInternals.T = previousTransition;
    DevjsDOMSharedInternals.p /* DevjsDOMCurrentUpdatePriority */ =
      previousUpdatePriority;
    const wasInRender =
      DevjsDOMSharedInternals.d /* DevjsDOMCurrentDispatcher */
        .f(); /* flushSyncWork */
    if (__DEV__) {
      if (wasInRender) {
        console.error(
          'flushSync was called from inside a lifecycle method. Devjs cannot ' +
            'flush when Devjs is already rendering. Consider moving this call to ' +
            'a scheduler task or micro task.',
        );
      }
    }
  }
}

declare function flushSyncErrorInBuildsThatSupportLegacyMode<R>(fn: () => R): R;
declare function flushSyncErrorInBuildsThatSupportLegacyMode(void): void;
function flushSyncErrorInBuildsThatSupportLegacyMode() {
  // eslint-disable-next-line devjs-internal/prod-error-codes
  throw new Error(
    'Expected this build of Devjs to not support legacy mode but it does. This is a bug in Devjs.',
  );
}

export const flushSync: typeof flushSyncImpl = disableLegacyMode
  ? flushSyncImpl
  : flushSyncErrorInBuildsThatSupportLegacyMode;
