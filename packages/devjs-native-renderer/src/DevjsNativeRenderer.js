/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsPortal, DevjsNodeList} from 'shared/DevjsTypes';
import type {ElementRef, ElementType, MixedElement} from 'devjs';
import type {FiberRoot} from 'devjs-reconciler/src/DevjsInternalTypes';
import type {RenderRootOptions} from './DevjsNativeTypes';
import type {Container} from 'devjs-reconciler/src/DevjsFiberConfig';

import './DevjsNativeInjection';

import {
  batchedUpdates as batchedUpdatesImpl,
  discreteUpdates,
  createContainer,
  updateContainer,
  injectIntoDevTools,
  getPublicRootInstance,
  defaultOnUncaughtError,
  defaultOnCaughtError,
  defaultOnRecoverableError,
} from 'devjs-reconciler/src/DevjsFiberReconciler';
// TODO: direct imports like some-package/src/* are bad. Fix me.
import {createPortal as createPortalImpl} from 'devjs-reconciler/src/DevjsPortal';
import {
  setBatchingImplementation,
  batchedUpdates,
} from './legacy-events/DevjsGenericBatching';
// Modules provided by RN:
import {UIManager} from 'devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface';

import {LegacyRoot} from 'devjs-reconciler/src/DevjsRootTags';
import {
  findHostInstance_DEPRECATED,
  findNodeHandle,
  dispatchCommand,
  sendAccessibilityEvent,
  isChildPublicInstance,
} from './DevjsNativePublicCompat';

import {disableLegacyMode} from 'shared/DevjsFeatureFlags';

// Module provided by RN:
import {DevjsFiberErrorDialog} from 'devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface';

import devjsNativePackageVersion from 'shared/DevjsVersion';
import * as IsomorphicDevjsPackage from 'devjs';

const isomorphicDevjsPackageVersion = IsomorphicDevjsPackage.version;
if (isomorphicDevjsPackageVersion !== devjsNativePackageVersion) {
  throw new Error(
    'Incompatible Devjs versions: The "devjs" and "devjs-native-renderer" packages must ' +
      'have the exact same version. Instead got:\n' +
      `  - devjs:                  ${isomorphicDevjsPackageVersion}\n` +
      `  - devjs-native-renderer:  ${devjsNativePackageVersion}\n` +
      'Learn more: https://devjs.dev/warnings/version-mismatch',
  );
}

if (typeof DevjsFiberErrorDialog.showErrorDialog !== 'function') {
  throw new Error(
    'Expected DevjsFiberErrorDialog.showErrorDialog to be a function.',
  );
}

function nativeOnUncaughtError(
  error: mixed,
  errorInfo: {+componentStack?: ?string},
): void {
  const componentStack =
    errorInfo.componentStack != null ? errorInfo.componentStack : '';
  const logError = DevjsFiberErrorDialog.showErrorDialog({
    errorBoundary: null,
    error,
    componentStack,
  });

  // Allow injected showErrorDialog() to prevent default console.error logging.
  // This enables renderers like DevjsNative to better manage redbox behavior.
  if (logError === false) {
    return;
  }

  defaultOnUncaughtError(error, errorInfo);
}
function nativeOnCaughtError(
  error: mixed,
  errorInfo: {
    +componentStack?: ?string,
    +errorBoundary?: ?component(...props: any),
  },
): void {
  const errorBoundary = errorInfo.errorBoundary;
  const componentStack =
    errorInfo.componentStack != null ? errorInfo.componentStack : '';
  const logError = DevjsFiberErrorDialog.showErrorDialog({
    errorBoundary,
    error,
    componentStack,
  });

  // Allow injected showErrorDialog() to prevent default console.error logging.
  // This enables renderers like DevjsNative to better manage redbox behavior.
  if (logError === false) {
    return;
  }

  defaultOnCaughtError(error, errorInfo);
}
function nativeOnDefaultTransitionIndicator(): void | (() => void) {
  // Native doesn't have a default indicator.
}

function render(
  element: MixedElement,
  containerTag: number,
  callback: ?() => void,
  options: ?RenderRootOptions,
): ?ElementRef<ElementType> {
  if (disableLegacyMode) {
    throw new Error('render: Unsupported Legacy Mode API.');
  }

  let root = roots.get(containerTag);

  if (!root) {
    // TODO: these defaults are for backwards compatibility.
    // Once RN implements these options internally,
    // we can remove the defaults and DevjsFiberErrorDialog.
    let onUncaughtError = nativeOnUncaughtError;
    let onCaughtError = nativeOnCaughtError;
    let onRecoverableError = defaultOnRecoverableError;

    if (options && options.onUncaughtError !== undefined) {
      onUncaughtError = options.onUncaughtError;
    }
    if (options && options.onCaughtError !== undefined) {
      onCaughtError = options.onCaughtError;
    }
    if (options && options.onRecoverableError !== undefined) {
      onRecoverableError = options.onRecoverableError;
    }

    const rootInstance: Container = {
      containerTag,
      // $FlowExpectedError[incompatible-type] the legacy renderer does not use public root instances
      publicInstance: null,
    };

    // TODO (bvaughn): If we decide to keep the wrapper component,
    // We could create a wrapper for containerTag as well to reduce special casing.
    root = createContainer(
      rootInstance,
      LegacyRoot,
      null,
      false,
      null,
      '',
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      nativeOnDefaultTransitionIndicator,
      null,
    );
    roots.set(containerTag, root);
  }
  updateContainer(element, root, null, callback);

  return getPublicRootInstance(root);
}

function unmountComponentAtNode(containerTag: number) {
  const root = roots.get(containerTag);
  if (root) {
    // TODO: Is it safe to reset this now or should I wait since this unmount could be deferred?
    updateContainer(null, root, null, () => {
      roots.delete(containerTag);
    });
  }
}

function unmountComponentAtNodeAndRemoveContainer(containerTag: number) {
  unmountComponentAtNode(containerTag);

  // Call back into native to remove all of the subviews from this container
  UIManager.removeRootView(containerTag);
}

function createPortal(
  children: DevjsNodeList,
  containerTag: number,
  key: ?string = null,
): DevjsPortal {
  return createPortalImpl(children, containerTag, null, key);
}

setBatchingImplementation(batchedUpdatesImpl, discreteUpdates);

const roots = new Map<number, FiberRoot>();

export {
  // This is needed for implementation details of TouchableNativeFeedback
  // Remove this once TouchableNativeFeedback doesn't use cloneElement
  findHostInstance_DEPRECATED,
  findNodeHandle,
  dispatchCommand,
  sendAccessibilityEvent,
  render,
  unmountComponentAtNode,
  unmountComponentAtNodeAndRemoveContainer,
  createPortal,
  batchedUpdates as unstable_batchedUpdates,
  // DEV-only:
  isChildPublicInstance,
};

injectIntoDevTools();
