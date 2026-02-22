/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsContext} from 'shared/DevjsTypes';

import {createContext} from 'devjs';

import type {
  CanViewElementSource,
  ViewElementSource,
} from 'devjs-devtools-shared/src/devtools/views/DevTools';

export type Context = {
  canViewElementSourceFunction: CanViewElementSource | null,
  viewElementSourceFunction: ViewElementSource | null,
};

const ViewElementSourceContext: DevjsContext<Context> = createContext<Context>(
  ((null: any): Context),
);
ViewElementSourceContext.displayName = 'ViewElementSourceContext';

export default ViewElementSourceContext;
