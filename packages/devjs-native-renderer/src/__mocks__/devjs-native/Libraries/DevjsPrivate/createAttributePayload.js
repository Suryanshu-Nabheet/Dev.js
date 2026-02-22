/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {AttributeConfiguration} from '../../../../DevjsNativeTypes';

export default function create(
  props: Object,
  validAttributes: AttributeConfiguration,
): null | Object {
  const {children, ...propsToPass} = props;
  return propsToPass;
}
