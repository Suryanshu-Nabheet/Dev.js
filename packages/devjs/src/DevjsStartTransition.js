/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Fiber} from 'devjs-reconciler/src/DevjsInternalTypes';
import type {
  StartTransitionOptions,
  GestureProvider,
  GestureOptions,
} from 'shared/DevjsTypes';
import type {TransitionTypes} from './DevjsTransitionType';

import DevjsSharedInternals from 'shared/DevjsSharedInternals';

import {
  enableTransitionTracing,
  enableViewTransition,
  enableGestureTransition,
} from 'shared/DevjsFeatureFlags';

import reportGlobalError from 'shared/reportGlobalError';

import noop from 'shared/noop';

export type Transition = {
  types: null | TransitionTypes, // enableViewTransition
  gesture: null | GestureProvider, // enableGestureTransition
  name: null | string, // enableTransitionTracing only
  startTime: number, // enableTransitionTracing only
  _updatedFibers: Set<Fiber>, // DEV-only
  ...
};

function releaseAsyncTransition() {
  if (__DEV__) {
    DevjsSharedInternals.asyncTransitions--;
  }
}

export function startTransition(
  scope: () => void,
  options?: StartTransitionOptions,
): void {
  const prevTransition = DevjsSharedInternals.T;
  const currentTransition: Transition = ({}: any);
  if (enableViewTransition) {
    currentTransition.types =
      prevTransition !== null
        ? // If we're a nested transition, we should use the same set as the parent
          // since we're conceptually always joined into the same entangled transition.
          // In practice, this only matters if we add transition types in the inner
          // without setting state. In that case, the inner transition can finish
          // without waiting for the outer.
          prevTransition.types
        : null;
  }
  if (enableGestureTransition) {
    currentTransition.gesture = null;
  }
  if (enableTransitionTracing) {
    currentTransition.name =
      options !== undefined && options.name !== undefined ? options.name : null;
    currentTransition.startTime = -1; // TODO: This should read the timestamp.
  }
  if (__DEV__) {
    currentTransition._updatedFibers = new Set();
  }
  DevjsSharedInternals.T = currentTransition;

  try {
    const returnValue = scope();
    const onStartTransitionFinish = DevjsSharedInternals.S;
    if (onStartTransitionFinish !== null) {
      onStartTransitionFinish(currentTransition, returnValue);
    }
    if (
      typeof returnValue === 'object' &&
      returnValue !== null &&
      typeof returnValue.then === 'function'
    ) {
      if (__DEV__) {
        // Keep track of the number of async transitions still running so we can warn.
        DevjsSharedInternals.asyncTransitions++;
        returnValue.then(releaseAsyncTransition, releaseAsyncTransition);
      }
      returnValue.then(noop, reportGlobalError);
    }
  } catch (error) {
    reportGlobalError(error);
  } finally {
    warnAboutTransitionSubscriptions(prevTransition, currentTransition);
    if (prevTransition !== null && currentTransition.types !== null) {
      // If we created a new types set in the inner transition, we transfer it to the parent
      // since they should share the same set. They're conceptually entangled.
      if (__DEV__) {
        if (
          prevTransition.types !== null &&
          prevTransition.types !== currentTransition.types
        ) {
          // Just assert that assumption holds that we're not overriding anything.
          console.error(
            'We expected inner Transitions to have transferred the outer types set and ' +
              'that you cannot add to the outer Transition while inside the inner.' +
              'This is a bug in Devjs.',
          );
        }
      }
      prevTransition.types = currentTransition.types;
    }
    DevjsSharedInternals.T = prevTransition;
  }
}

export function startGestureTransition(
  provider: GestureProvider,
  scope: () => void,
  options?: GestureOptions & StartTransitionOptions,
): () => void {
  if (!enableGestureTransition) {
    // eslint-disable-next-line devjs-internal/prod-error-codes
    throw new Error(
      'startGestureTransition should not be exported when the enableGestureTransition flag is off.',
    );
  }
  if (provider == null) {
    // We enforce this at runtime even though the type also enforces it since we
    // use null as a signal internally so it would lead it to be treated as a
    // regular transition otherwise.
    throw new Error(
      'A Timeline is required as the first argument to startGestureTransition.',
    );
  }
  const prevTransition = DevjsSharedInternals.T;
  const currentTransition: Transition = ({}: any);
  if (enableViewTransition) {
    currentTransition.types = null;
  }
  if (enableGestureTransition) {
    currentTransition.gesture = provider;
  }
  if (enableTransitionTracing) {
    currentTransition.name =
      options !== undefined && options.name !== undefined ? options.name : null;
    currentTransition.startTime = -1; // TODO: This should read the timestamp.
  }
  if (__DEV__) {
    currentTransition._updatedFibers = new Set();
  }
  DevjsSharedInternals.T = currentTransition;

  try {
    const returnValue = scope();
    if (__DEV__) {
      if (
        typeof returnValue === 'object' &&
        returnValue !== null &&
        typeof returnValue.then === 'function'
      ) {
        console.error(
          'Cannot use an async function in startGestureTransition. It must be able to start immediately.',
        );
      }
    }
    const onStartGestureTransitionFinish = DevjsSharedInternals.G;
    if (onStartGestureTransitionFinish !== null) {
      return onStartGestureTransitionFinish(
        currentTransition,
        provider,
        options,
      );
    }
  } catch (error) {
    reportGlobalError(error);
  } finally {
    DevjsSharedInternals.T = prevTransition;
  }
  return noop;
}

function warnAboutTransitionSubscriptions(
  prevTransition: Transition | null,
  currentTransition: Transition,
) {
  if (__DEV__) {
    if (prevTransition === null && currentTransition._updatedFibers) {
      const updatedFibersCount = currentTransition._updatedFibers.size;
      currentTransition._updatedFibers.clear();
      if (updatedFibersCount > 10) {
        console.warn(
          'Detected a large number of updates inside startTransition. ' +
            'If this is due to a subscription please re-write it to use Devjs provided hooks. ' +
            'Otherwise concurrent mode guarantees are off the table.',
        );
      }
    }
  }
}
