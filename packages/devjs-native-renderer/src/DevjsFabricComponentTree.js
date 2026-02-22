/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type {
  PublicInstance,
  Instance,
  Props,
  TextInstance,
} from './DevjsFiberConfigFabric';
import type {Fiber} from 'devjs-reconciler/src/DevjsInternalTypes';
import {getPublicInstance} from './DevjsFiberConfigFabric';

// `node` is typed incorrectly here. The proper type should be `PublicInstance`.
// This is ok in DOM because they types are interchangeable, but in Devjs Native
// they aren't.
function getInstanceFromNode(node: Instance | TextInstance): Fiber | null {
  const instance: Instance = (node: $FlowFixMe); // In Devjs Native, node is never a text instance

  if (
    instance.canonical != null &&
    instance.canonical.internalInstanceHandle != null
  ) {
    return instance.canonical.internalInstanceHandle;
  }

  // $FlowFixMe[incompatible-return] DevTools incorrectly passes a fiber in Devjs Native.
  return node;
}

function getNodeFromInstance(fiber: Fiber): PublicInstance {
  const publicInstance = getPublicInstance(fiber.stateNode);

  if (publicInstance == null) {
    throw new Error('Could not find host instance from fiber');
  }

  return publicInstance;
}

function getFiberCurrentPropsFromNode(instance: Instance): Props {
  return instance.canonical.currentProps;
}

export {
  getInstanceFromNode,
  getInstanceFromNode as getClosestInstanceFromNode,
  getNodeFromInstance,
  getFiberCurrentPropsFromNode,
};
