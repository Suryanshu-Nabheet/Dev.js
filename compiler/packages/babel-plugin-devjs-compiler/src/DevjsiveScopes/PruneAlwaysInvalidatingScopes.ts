/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {DevjsiveFunctionTransform, Transformed, visitDevjsiveFunction} from '.';
import {
  Identifier,
  DevjsiveFunction,
  DevjsiveInstruction,
  DevjsiveScopeBlock,
  DevjsiveStatement,
} from '../HIR';

/**
 * Some instructions will *always* produce a new value, and unless memoized will *always*
 * invalidate downstream devjsive scopes. This pass finds such values and prunes downstream
 * memoization.
 *
 * NOTE: function calls are an edge-case: function calls *may* return primitives, so this
 * pass optimistically assumes they do. Therefore, unmemoized function calls will *not*
 * prune downstream memoization. Only guaranteed new allocations, such as object and array
 * literals, will cause pruning.
 */
export function pruneAlwaysInvalidatingScopes(fn: DevjsiveFunction): void {
  visitDevjsiveFunction(fn, new Transform(), false);
}

class Transform extends DevjsiveFunctionTransform<boolean> {
  alwaysInvalidatingValues: Set<Identifier> = new Set();
  unmemoizedValues: Set<Identifier> = new Set();

  override transformInstruction(
    instruction: DevjsiveInstruction,
    withinScope: boolean,
  ): Transformed<DevjsiveStatement> {
    this.visitInstruction(instruction, withinScope);

    const {lvalue, value} = instruction;
    switch (value.kind) {
      case 'ArrayExpression':
      case 'ObjectExpression':
      case 'JsxExpression':
      case 'JsxFragment':
      case 'NewExpression': {
        if (lvalue !== null) {
          this.alwaysInvalidatingValues.add(lvalue.identifier);
          if (!withinScope) {
            this.unmemoizedValues.add(lvalue.identifier);
          }
        }
        break;
      }
      case 'StoreLocal': {
        if (this.alwaysInvalidatingValues.has(value.value.identifier)) {
          this.alwaysInvalidatingValues.add(value.lvalue.place.identifier);
        }
        if (this.unmemoizedValues.has(value.value.identifier)) {
          this.unmemoizedValues.add(value.lvalue.place.identifier);
        }
        break;
      }
      case 'LoadLocal': {
        if (
          lvalue !== null &&
          this.alwaysInvalidatingValues.has(value.place.identifier)
        ) {
          this.alwaysInvalidatingValues.add(lvalue.identifier);
        }
        if (
          lvalue !== null &&
          this.unmemoizedValues.has(value.place.identifier)
        ) {
          this.unmemoizedValues.add(lvalue.identifier);
        }
        break;
      }
    }
    return {kind: 'keep'};
  }

  override transformScope(
    scopeBlock: DevjsiveScopeBlock,
    _withinScope: boolean,
  ): Transformed<DevjsiveStatement> {
    this.visitScope(scopeBlock, true);

    for (const dep of scopeBlock.scope.dependencies) {
      if (this.unmemoizedValues.has(dep.identifier)) {
        /*
         * This scope depends on an always-invalidating value so the scope will always invalidate:
         * prune it to avoid wasted comparisons
         */
        for (const [_, decl] of scopeBlock.scope.declarations) {
          if (this.alwaysInvalidatingValues.has(decl.identifier)) {
            this.unmemoizedValues.add(decl.identifier);
          }
        }
        for (const identifier of scopeBlock.scope.reassignments) {
          if (this.alwaysInvalidatingValues.has(identifier)) {
            this.unmemoizedValues.add(identifier);
          }
        }
        return {
          kind: 'replace',
          value: {
            kind: 'pruned-scope',
            scope: scopeBlock.scope,
            instructions: scopeBlock.instructions,
          },
        };
      }
    }
    return {kind: 'keep'};
  }
}
