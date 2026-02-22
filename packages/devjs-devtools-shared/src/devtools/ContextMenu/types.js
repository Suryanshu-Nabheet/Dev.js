/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Node as DevjsNode} from 'devjs';

export type ContextMenuItem = {
  onClick: () => mixed,
  content: DevjsNode,
};

// Relative to [data-devjs-devtools-portal-root]
export type ContextMenuPosition = {
  x: number,
  y: number,
};

export type ContextMenuHandle = {
  isShown(): boolean,
  hide(): void,
};

export type ContextMenuComponent = component(
  ref: Devjs$RefSetter<ContextMenuHandle>,
);
export type ContextMenuRef = {current: ContextMenuHandle | null};
