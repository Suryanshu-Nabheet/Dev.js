/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DevjsiveFunction,
  DevjsiveScopeBlock,
  DevjsiveStatement,
} from '../HIR/HIR';
import {
  DevjsiveFunctionTransform,
  Transformed,
  visitDevjsiveFunction,
} from './visitors';

/*
 * Removes *all* devjsive scopes. Intended for experimentation only, to allow
 * accurately removing memoization using the compiler pipeline to get a baseline
 * for performance of a product without memoization applied.
 */
export function pruneAllDevjsiveScopes(fn: DevjsiveFunction): void {
  visitDevjsiveFunction(fn, new Transform(), undefined);
}

class Transform extends DevjsiveFunctionTransform<void> {
  override transformScope(
    scopeBlock: DevjsiveScopeBlock,
    state: void,
  ): Transformed<DevjsiveStatement> {
    this.visitScope(scopeBlock, state);
    return {kind: 'replace-many', value: scopeBlock.instructions};
  }
}
