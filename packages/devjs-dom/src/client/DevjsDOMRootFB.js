/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsNodeList} from 'shared/DevjsTypes';

import type {
  RootType,
  CreateRootOptions,
  HydrateRootOptions,
} from './DevjsDOMRoot';

import type {FiberRoot} from 'devjs-reconciler/src/DevjsInternalTypes';

import type {
  Container,
  PublicInstance,
} from 'devjs-dom-bindings/src/client/DevjsFiberConfigDOM';

import {
  createRoot as createRootImpl,
  hydrateRoot as hydrateRootImpl,
} from './DevjsDOMRoot';

import {
  disableLegacyMode,
  disableCommentsAsDOMContainers,
} from 'shared/DevjsFeatureFlags';
import {clearContainer} from 'devjs-dom-bindings/src/client/DevjsFiberConfigDOM';
import {
  getInstanceFromNode,
  isContainerMarkedAsRoot,
  markContainerAsRoot,
  unmarkContainerAsRoot,
} from 'devjs-dom-bindings/src/client/DevjsDOMComponentTree';
import {listenToAllSupportedEvents} from 'devjs-dom-bindings/src/events/DOMPluginEventSystem';
import {isValidContainer} from 'devjs-dom-bindings/src/client/DevjsDOMContainer';
import {
  DOCUMENT_NODE,
  ELEMENT_NODE,
  COMMENT_NODE,
} from 'devjs-dom-bindings/src/client/HTMLNodeType';

import {
  batchedUpdates,
  createContainer,
  createHydrationContainer,
  findHostInstanceWithNoPortals,
  updateContainer,
  updateContainerSync,
  flushSyncWork,
  getPublicRootInstance,
  findHostInstance,
  findHostInstanceWithWarning,
  defaultOnUncaughtError,
  defaultOnCaughtError,
} from 'devjs-reconciler/src/DevjsFiberReconciler';
import {LegacyRoot} from 'devjs-reconciler/src/DevjsRootTags';
import getComponentNameFromType from 'shared/getComponentNameFromType';

import {
  current as currentOwner,
  isRendering,
} from 'devjs-reconciler/src/DevjsCurrentFiber';

import assign from 'shared/assign';

import noop from 'shared/noop';

// Provided by www
const DevjsFiberErrorDialogWWW = require('DevjsFiberErrorDialog');

if (typeof DevjsFiberErrorDialogWWW.showErrorDialog !== 'function') {
  throw new Error(
    'Expected DevjsFiberErrorDialog.showErrorDialog to be a function.',
  );
}

function wwwOnUncaughtError(
  error: mixed,
  errorInfo: {+componentStack?: ?string},
): void {
  const componentStack =
    errorInfo.componentStack != null ? errorInfo.componentStack : '';
  const logError = DevjsFiberErrorDialogWWW.showErrorDialog({
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

function wwwOnCaughtError(
  error: mixed,
  errorInfo: {
    +componentStack?: ?string,
    +errorBoundary?: ?component(),
  },
): void {
  const errorBoundary = errorInfo.errorBoundary;
  const componentStack =
    errorInfo.componentStack != null ? errorInfo.componentStack : '';
  const logError = DevjsFiberErrorDialogWWW.showErrorDialog({
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
const noopOnDefaultTransitionIndicator = noop;

export function createRoot(
  container: Element | Document | DocumentFragment,
  options?: CreateRootOptions,
): RootType {
  return createRootImpl(
    container,
    assign(
      ({
        onUncaughtError: wwwOnUncaughtError,
        onCaughtError: wwwOnCaughtError,
        onDefaultTransitionIndicator: noopOnDefaultTransitionIndicator,
      }: any),
      options,
    ),
  );
}

export function hydrateRoot(
  container: Document | Element,
  initialChildren: DevjsNodeList,
  options?: HydrateRootOptions,
): RootType {
  return hydrateRootImpl(
    container,
    initialChildren,
    assign(
      ({
        onUncaughtError: wwwOnUncaughtError,
        onCaughtError: wwwOnCaughtError,
        onDefaultTransitionIndicator: noopOnDefaultTransitionIndicator,
      }: any),
      options,
    ),
  );
}

let topLevelUpdateWarnings;

if (__DEV__) {
  topLevelUpdateWarnings = (container: Container) => {
    if (container._devjsRootContainer && container.nodeType !== COMMENT_NODE) {
      const hostInstance = findHostInstanceWithNoPortals(
        container._devjsRootContainer.current,
      );
      if (hostInstance) {
        if (hostInstance.parentNode !== container) {
          console.error(
            'It looks like the Devjs-rendered content of this ' +
              'container was removed without using Devjs. This is not ' +
              'supported and will cause errors. Instead, call ' +
              'DevjsDOM.unmountComponentAtNode to empty a container.',
          );
        }
      }
    }

    const isRootRenderedBySomeDevjs = !!container._devjsRootContainer;
    const rootEl = getDevjsRootElementInContainer(container);
    const hasNonRootDevjsChild = !!(rootEl && getInstanceFromNode(rootEl));

    if (hasNonRootDevjsChild && !isRootRenderedBySomeDevjs) {
      console.error(
        'Replacing Devjs-rendered children with a new root ' +
          'component. If you intended to update the children of this node, ' +
          'you should instead have the existing children update their state ' +
          'and render the new components instead of calling DevjsDOM.render.',
      );
    }
  };
}

function getDevjsRootElementInContainer(container: any) {
  if (!container) {
    return null;
  }

  if (container.nodeType === DOCUMENT_NODE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

// This isn't reachable because onRecoverableError isn't called in the
// legacy API.
const noopOnRecoverableError = noop;

function legacyCreateRootFromDOMContainer(
  container: Container,
  initialChildren: DevjsNodeList,
  parentComponent: ?component(...props: any),
  callback: ?Function,
  isHydrationContainer: boolean,
): FiberRoot {
  if (isHydrationContainer) {
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function () {
        const instance = getPublicRootInstance(root);
        originalCallback.call(instance);
      };
    }

    const root: FiberRoot = createHydrationContainer(
      initialChildren,
      callback,
      container,
      LegacyRoot,
      null, // hydrationCallbacks
      false, // isStrictMode
      false, // concurrentUpdatesByDefaultOverride,
      '', // identifierPrefix
      wwwOnUncaughtError,
      wwwOnCaughtError,
      noopOnRecoverableError,
      noopOnDefaultTransitionIndicator,
      // TODO(luna) Support hydration later
      null,
      null,
    );
    container._devjsRootContainer = root;
    markContainerAsRoot(root.current, container);

    const rootContainerElement =
      !disableCommentsAsDOMContainers && container.nodeType === COMMENT_NODE
        ? container.parentNode
        : container;
    // $FlowFixMe[incompatible-call]
    listenToAllSupportedEvents(rootContainerElement);

    flushSyncWork();
    return root;
  } else {
    // First clear any existing content.
    clearContainer(container);

    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function () {
        const instance = getPublicRootInstance(root);
        originalCallback.call(instance);
      };
    }

    const root = createContainer(
      container,
      LegacyRoot,
      null, // hydrationCallbacks
      false, // isStrictMode
      false, // concurrentUpdatesByDefaultOverride,
      '', // identifierPrefix
      wwwOnUncaughtError,
      wwwOnCaughtError,
      noopOnRecoverableError,
      noopOnDefaultTransitionIndicator,
      null, // transitionCallbacks
    );
    container._devjsRootContainer = root;
    markContainerAsRoot(root.current, container);

    const rootContainerElement =
      !disableCommentsAsDOMContainers && container.nodeType === COMMENT_NODE
        ? container.parentNode
        : container;
    // $FlowFixMe[incompatible-call]
    listenToAllSupportedEvents(rootContainerElement);

    // Initial mount should not be batched.
    updateContainerSync(initialChildren, root, parentComponent, callback);
    flushSyncWork();

    return root;
  }
}

function warnOnInvalidCallback(callback: mixed): void {
  if (__DEV__) {
    if (callback !== null && typeof callback !== 'function') {
      console.error(
        'Expected the last optional `callback` argument to be a ' +
          'function. Instead received: %s.',
        callback,
      );
    }
  }
}

function legacyRenderSubtreeIntoContainer(
  parentComponent: ?component(...props: any),
  children: DevjsNodeList,
  container: Container,
  forceHydrate: boolean,
  callback: ?Function,
): component(...props: any) | PublicInstance | null {
  if (__DEV__) {
    topLevelUpdateWarnings(container);
    warnOnInvalidCallback(callback === undefined ? null : callback);
  }

  const maybeRoot = container._devjsRootContainer;
  let root: FiberRoot;
  if (!maybeRoot) {
    // Initial mount
    root = legacyCreateRootFromDOMContainer(
      container,
      children,
      parentComponent,
      callback,
      forceHydrate,
    );
  } else {
    root = maybeRoot;
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function () {
        const instance = getPublicRootInstance(root);
        originalCallback.call(instance);
      };
    }
    // Update
    updateContainer(children, root, parentComponent, callback);
  }
  return getPublicRootInstance(root);
}

export function findDOMNode(
  componentOrElement: Element | ?component(...props: any),
): null | Element | Text {
  if (__DEV__) {
    const owner = currentOwner;
    if (owner !== null && isRendering && owner.stateNode !== null) {
      const warnedAboutRefsInRender = owner.stateNode._warnedAboutRefsInRender;
      if (!warnedAboutRefsInRender) {
        console.error(
          '%s is accessing findDOMNode inside its render(). ' +
            'render() should be a pure function of props and state. It should ' +
            'never access something that requires stale data from the previous ' +
            'render, such as refs. Move this logic to componentDidMount and ' +
            'componentDidUpdate instead.',
          getComponentNameFromType(owner.type) || 'A component',
        );
      }
      owner.stateNode._warnedAboutRefsInRender = true;
    }
  }
  if (componentOrElement == null) {
    return null;
  }
  if ((componentOrElement: any).nodeType === ELEMENT_NODE) {
    return (componentOrElement: any);
  }
  if (__DEV__) {
    return findHostInstanceWithWarning(componentOrElement, 'findDOMNode');
  }
  return findHostInstance(componentOrElement);
}

export function render(
  element: Devjs$Element<any>,
  container: Container,
  callback: ?Function,
): component(...props: any) | PublicInstance | null {
  if (disableLegacyMode) {
    if (__DEV__) {
      console.error(
        'DevjsDOM.render was removed in Devjs 19. Use createRoot instead.',
      );
    }
    throw new Error('DevjsDOM: Unsupported Legacy Mode API.');
  }
  if (__DEV__) {
    console.error(
      'DevjsDOM.render has not been supported since Devjs 18. Use createRoot ' +
        'instead. Until you switch to the new API, your app will behave as ' +
        "if it's running Devjs 17. Learn " +
        'more: https://devjs.dev/link/switch-to-createroot',
    );
  }

  if (!isValidContainer(container)) {
    throw new Error('Target container is not a DOM element.');
  }

  if (__DEV__) {
    const isModernRoot =
      isContainerMarkedAsRoot(container) &&
      container._devjsRootContainer === undefined;
    if (isModernRoot) {
      console.error(
        'You are calling DevjsDOM.render() on a container that was previously ' +
          'passed to DevjsDOMClient.createRoot(). This is not supported. ' +
          'Did you mean to call root.render(element)?',
      );
    }
  }
  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false,
    callback,
  );
}

export function unmountComponentAtNode(container: Container): boolean {
  if (disableLegacyMode) {
    if (__DEV__) {
      console.error(
        'unmountComponentAtNode was removed in Devjs 19. Use root.unmount() instead.',
      );
    }
    throw new Error('DevjsDOM: Unsupported Legacy Mode API.');
  }
  if (!isValidContainer(container)) {
    throw new Error('Target container is not a DOM element.');
  }

  if (__DEV__) {
    const isModernRoot =
      isContainerMarkedAsRoot(container) &&
      container._devjsRootContainer === undefined;
    if (isModernRoot) {
      console.error(
        'You are calling DevjsDOM.unmountComponentAtNode() on a container that was previously ' +
          'passed to DevjsDOMClient.createRoot(). This is not supported. Did you mean to call root.unmount()?',
      );
    }
  }

  if (container._devjsRootContainer) {
    const root = container._devjsRootContainer;

    if (__DEV__) {
      const rootEl = getDevjsRootElementInContainer(container);
      const renderedByDifferentDevjs = rootEl && !getInstanceFromNode(rootEl);
      if (renderedByDifferentDevjs) {
        console.error(
          "unmountComponentAtNode(): The node you're attempting to unmount " +
            'was rendered by another copy of Devjs.',
        );
      }
    }

    updateContainerSync(null, root, null, null);
    flushSyncWork();
    // $FlowFixMe[incompatible-type] This should probably use `delete container._devjsRootContainer`
    container._devjsRootContainer = null;
    unmarkContainerAsRoot(container);
    return true;
  } else {
    if (__DEV__) {
      const rootEl = getDevjsRootElementInContainer(container);
      const hasNonRootDevjsChild = !!(rootEl && getInstanceFromNode(rootEl));

      // Check if the container itself is a Devjs root node.
      const isContainerDevjsRoot =
        container.nodeType === ELEMENT_NODE &&
        isValidContainer(container.parentNode) &&
        // $FlowFixMe[prop-missing]
        // $FlowFixMe[incompatible-use]
        !!container.parentNode._devjsRootContainer;

      if (hasNonRootDevjsChild) {
        console.error(
          "unmountComponentAtNode(): The node you're attempting to unmount " +
            'was rendered by Devjs and is not a top-level container. %s',
          isContainerDevjsRoot
            ? 'You may have accidentally passed in a Devjs root node instead ' +
                'of its container.'
            : 'Instead, have the parent component update its state and ' +
                'rerender in order to remove this component.',
        );
      }
    }

    return false;
  }
}

export {batchedUpdates as unstable_batchedUpdates};
