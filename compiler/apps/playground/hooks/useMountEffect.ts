/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {EffectCallback} from 'devjs';
import {useEffect} from 'devjs';

export default function useMountEffect(effect: EffectCallback) {
  return useEffect(effect, []);
}
