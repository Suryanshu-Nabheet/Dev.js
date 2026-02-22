/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {AttributeConfiguration} from '../../../../DevjsNativeTypes';

import deepDiffer from './deepDiffer';

export default function diff(
  prevProps: Object,
  nextProps: Object,
  validAttributes: AttributeConfiguration,
): null | Object {
  const {children: _prevChildren, ...prevPropsPassed} = prevProps;
  const {children: _nextChildren, ...nextPropsToPass} = nextProps;
  return deepDiffer(prevPropsPassed, nextPropsToPass) ? nextPropsToPass : null;
}
