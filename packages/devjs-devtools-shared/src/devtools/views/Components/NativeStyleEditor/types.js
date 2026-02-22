/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {
  Layout as LayoutBackend,
  Style as StyleBackend,
} from 'devjs-devtools-shared/src/backend/NativeStyleEditor/types';

export type Layout = LayoutBackend;
export type Style = StyleBackend;
export type StyleAndLayout = {
  layout: LayoutBackend | null,
  style: StyleBackend | null,
};
