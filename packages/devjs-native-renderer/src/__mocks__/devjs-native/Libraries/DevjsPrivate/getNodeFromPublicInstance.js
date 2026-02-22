/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {PublicInstance} from './DevjsNativePrivateInterface';

import {getNodeFromInternalInstanceHandle} from '../../../../DevjsNativePublicCompat';

export default function getNodeFromPublicInstance(
  publicInstance: PublicInstance,
) {
  return getNodeFromInternalInstanceHandle(
    publicInstance.__internalInstanceHandle,
  );
}
