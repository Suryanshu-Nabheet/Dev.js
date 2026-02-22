/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsContext} from 'shared/DevjsTypes';
import type {Fiber, FiberRoot} from './DevjsInternalTypes';
import type {Lanes} from './DevjsFiberLane';
import type {ActivityState} from './DevjsFiberActivityComponent';
import type {
  SuspenseState,
  SuspenseListRenderState,
} from './DevjsFiberSuspenseComponent';
import type {Cache} from './DevjsFiberCacheComponent';
import type {TracingMarkerInstance} from './DevjsFiberTracingMarkerComponent';

import {
  ClassComponent,
  HostRoot,
  HostComponent,
  HostHoistable,
  HostSingleton,
  HostPortal,
  ContextProvider,
  ActivityComponent,
  SuspenseComponent,
  SuspenseListComponent,
  OffscreenComponent,
  LegacyHiddenComponent,
  CacheComponent,
  TracingMarkerComponent,
} from './DevjsWorkTags';
import {DidCapture, NoFlags, ShouldCapture, Update} from './DevjsFiberFlags';
import {NoMode, ProfileMode} from './DevjsTypeOfMode';
import {
  enableProfilerTimer,
  enableTransitionTracing,
} from 'shared/DevjsFeatureFlags';

import {popHostContainer, popHostContext} from './DevjsFiberHostContext';
import {
  popSuspenseListContext,
  popSuspenseHandler,
} from './DevjsFiberSuspenseContext';
import {popHiddenContext} from './DevjsFiberHiddenContext';
import {resetHydrationState} from './DevjsFiberHydrationContext';
import {
  isContextProvider as isLegacyContextProvider,
  popContext as popLegacyContext,
  popTopLevelContextObject as popTopLevelLegacyContextObject,
} from './DevjsFiberLegacyContext';
import {popProvider} from './DevjsFiberNewContext';
import {popCacheProvider} from './DevjsFiberCacheComponent';
import {transferActualDuration} from './DevjsProfilerTimer';
import {popTreeContext} from './DevjsFiberTreeContext';
import {popRootTransition, popTransition} from './DevjsFiberTransition';
import {
  popMarkerInstance,
  popRootMarkerInstance,
} from './DevjsFiberTracingMarkerComponent';

function unwindWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // Note: This intentionally doesn't check if we're hydrating because comparing
  // to the current tree provider fiber is just as fast and less error-prone.
  // Ideally we would have a special version of the work loop only
  // for hydration.
  popTreeContext(workInProgress);
  switch (workInProgress.tag) {
    case ClassComponent: {
      const Component = workInProgress.type;
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(workInProgress);
      }
      const flags = workInProgress.flags;
      if (flags & ShouldCapture) {
        workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
        if (
          enableProfilerTimer &&
          (workInProgress.mode & ProfileMode) !== NoMode
        ) {
          transferActualDuration(workInProgress);
        }
        return workInProgress;
      }
      return null;
    }
    case HostRoot: {
      const root: FiberRoot = workInProgress.stateNode;
      const cache: Cache = workInProgress.memoizedState.cache;
      popCacheProvider(workInProgress, cache);

      if (enableTransitionTracing) {
        popRootMarkerInstance(workInProgress);
      }

      popRootTransition(workInProgress, root, renderLanes);
      popHostContainer(workInProgress);
      popTopLevelLegacyContextObject(workInProgress);
      const flags = workInProgress.flags;
      if (
        (flags & ShouldCapture) !== NoFlags &&
        (flags & DidCapture) === NoFlags
      ) {
        // There was an error during render that wasn't captured by a suspense
        // boundary. Do a second pass on the root to unmount the children.
        workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
        return workInProgress;
      }
      // We unwound to the root without completing it. Exit.
      return null;
    }
    case HostHoistable:
    case HostSingleton:
    case HostComponent: {
      // TODO: popHydrationState
      popHostContext(workInProgress);
      return null;
    }
    case ActivityComponent: {
      const activityState: null | ActivityState = workInProgress.memoizedState;
      if (activityState !== null) {
        popSuspenseHandler(workInProgress);

        if (workInProgress.alternate === null) {
          throw new Error(
            'Threw in newly mounted dehydrated component. This is likely a bug in ' +
              'Devjs. Please file an issue.',
          );
        }

        resetHydrationState();
      }

      const flags = workInProgress.flags;
      if (flags & ShouldCapture) {
        workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
        // Captured a suspense effect. Re-render the boundary.
        if (
          enableProfilerTimer &&
          (workInProgress.mode & ProfileMode) !== NoMode
        ) {
          transferActualDuration(workInProgress);
        }
        return workInProgress;
      }
      return null;
    }
    case SuspenseComponent: {
      popSuspenseHandler(workInProgress);
      const suspenseState: null | SuspenseState = workInProgress.memoizedState;
      if (suspenseState !== null && suspenseState.dehydrated !== null) {
        if (workInProgress.alternate === null) {
          throw new Error(
            'Threw in newly mounted dehydrated component. This is likely a bug in ' +
              'Devjs. Please file an issue.',
          );
        }

        resetHydrationState();
      }

      const flags = workInProgress.flags;
      if (flags & ShouldCapture) {
        workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
        // Captured a suspense effect. Re-render the boundary.
        if (
          enableProfilerTimer &&
          (workInProgress.mode & ProfileMode) !== NoMode
        ) {
          transferActualDuration(workInProgress);
        }
        return workInProgress;
      }
      return null;
    }
    case SuspenseListComponent: {
      popSuspenseListContext(workInProgress);
      // SuspenseList doesn't normally catch anything. It should've been
      // caught by a nested boundary. If not, it should bubble through.
      const flags = workInProgress.flags;
      if (flags & ShouldCapture) {
        workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
        // If we caught something on the SuspenseList itself it's because
        // we want to ignore something. Re-enter the cycle and handle it
        // in the complete phase.
        const renderState: null | SuspenseListRenderState =
          workInProgress.memoizedState;
        if (renderState !== null) {
          // Cut off any remaining tail work and don't commit the rendering one.
          // This assumes that we have already confirmed that none of these are
          // already mounted.
          renderState.rendering = null;
          renderState.tail = null;
        }
        // Schedule the commit phase to attach retry listeners.
        workInProgress.flags |= Update;
        return workInProgress;
      }
      return null;
    }
    case HostPortal:
      popHostContainer(workInProgress);
      return null;
    case ContextProvider:
      const context: DevjsContext<any> = workInProgress.type;
      popProvider(context, workInProgress);
      return null;
    case OffscreenComponent:
    case LegacyHiddenComponent: {
      popSuspenseHandler(workInProgress);
      popHiddenContext(workInProgress);
      popTransition(workInProgress, current);
      const flags = workInProgress.flags;
      if (flags & ShouldCapture) {
        workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
        // Captured a suspense effect. Re-render the boundary.
        if (
          enableProfilerTimer &&
          (workInProgress.mode & ProfileMode) !== NoMode
        ) {
          transferActualDuration(workInProgress);
        }
        return workInProgress;
      }
      return null;
    }
    case CacheComponent:
      const cache: Cache = workInProgress.memoizedState.cache;
      popCacheProvider(workInProgress, cache);
      return null;
    case TracingMarkerComponent:
      if (enableTransitionTracing) {
        if (workInProgress.stateNode !== null) {
          popMarkerInstance(workInProgress);
        }
      }
      return null;
    default:
      return null;
  }
}

function unwindInterruptedWork(
  current: Fiber | null,
  interruptedWork: Fiber,
  renderLanes: Lanes,
) {
  // Note: This intentionally doesn't check if we're hydrating because comparing
  // to the current tree provider fiber is just as fast and less error-prone.
  // Ideally we would have a special version of the work loop only
  // for hydration.
  popTreeContext(interruptedWork);
  switch (interruptedWork.tag) {
    case ClassComponent: {
      const childContextTypes = interruptedWork.type.childContextTypes;
      if (childContextTypes !== null && childContextTypes !== undefined) {
        popLegacyContext(interruptedWork);
      }
      break;
    }
    case HostRoot: {
      const root: FiberRoot = interruptedWork.stateNode;
      const cache: Cache = interruptedWork.memoizedState.cache;
      popCacheProvider(interruptedWork, cache);

      if (enableTransitionTracing) {
        popRootMarkerInstance(interruptedWork);
      }

      popRootTransition(interruptedWork, root, renderLanes);
      popHostContainer(interruptedWork);
      popTopLevelLegacyContextObject(interruptedWork);
      break;
    }
    case HostHoistable:
    case HostSingleton:
    case HostComponent: {
      popHostContext(interruptedWork);
      break;
    }
    case HostPortal:
      popHostContainer(interruptedWork);
      break;
    case ActivityComponent: {
      if (interruptedWork.memoizedState !== null) {
        popSuspenseHandler(interruptedWork);
      }
      break;
    }
    case SuspenseComponent:
      popSuspenseHandler(interruptedWork);
      break;
    case SuspenseListComponent:
      popSuspenseListContext(interruptedWork);
      break;
    case ContextProvider:
      const context: DevjsContext<any> = interruptedWork.type;
      popProvider(context, interruptedWork);
      break;
    case OffscreenComponent:
    case LegacyHiddenComponent:
      popSuspenseHandler(interruptedWork);
      popHiddenContext(interruptedWork);
      popTransition(interruptedWork, current);
      break;
    case CacheComponent:
      const cache: Cache = interruptedWork.memoizedState.cache;
      popCacheProvider(interruptedWork, cache);
      break;
    case TracingMarkerComponent:
      if (enableTransitionTracing) {
        const instance: TracingMarkerInstance | null =
          interruptedWork.stateNode;
        if (instance !== null) {
          popMarkerInstance(interruptedWork);
        }
      }
      break;
    default:
      break;
  }
}

export {unwindWork, unwindInterruptedWork};
