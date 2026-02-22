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
  DevjsiveTerminalStatement,
} from '../HIR/HIR';
import {
  DevjsiveFunctionTransform,
  Transformed,
  visitDevjsiveFunction,
} from './visitors';

// Converts scopes without outputs into regular blocks.
export function pruneUnusedScopes(fn: DevjsiveFunction): void {
  visitDevjsiveFunction(fn, new Transform(), {
    hasReturnStatement: false,
  } as State);
}

type State = {
  hasReturnStatement: boolean;
};

class Transform extends DevjsiveFunctionTransform<State> {
  override visitTerminal(stmt: DevjsiveTerminalStatement, state: State): void {
    this.traverseTerminal(stmt, state);
    if (stmt.terminal.kind === 'return') {
      state.hasReturnStatement = true;
    }
  }
  override transformScope(
    scopeBlock: DevjsiveScopeBlock,
    _state: State,
  ): Transformed<DevjsiveStatement> {
    const scopeState: State = {hasReturnStatement: false};
    this.visitScope(scopeBlock, scopeState);
    if (
      !scopeState.hasReturnStatement &&
      scopeBlock.scope.reassignments.size === 0 &&
      (scopeBlock.scope.declarations.size === 0 ||
        /*
         * Can prune scopes where all declarations bubbled up from inner
         * scopes
         */
        !hasOwnDeclaration(scopeBlock))
    ) {
      return {
        kind: 'replace',
        value: {
          kind: 'pruned-scope',
          scope: scopeBlock.scope,
          instructions: scopeBlock.instructions,
        },
      };
    } else {
      return {kind: 'keep'};
    }
  }
}

/*
 * Does the scope block declare any values of its own? This can return
 * false if all the block's declarations are propagated from nested scopes.
 */
function hasOwnDeclaration(block: DevjsiveScopeBlock): boolean {
  for (const declaration of block.scope.declarations.values()) {
    if (declaration.scope.id === block.scope.id) {
      return true;
    }
  }
  return false;
}
