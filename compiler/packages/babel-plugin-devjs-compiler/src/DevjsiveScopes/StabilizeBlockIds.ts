/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  BlockId,
  DevjsiveFunction,
  DevjsiveScopeBlock,
  DevjsiveTerminalStatement,
  makeBlockId,
} from '../HIR';
import {getOrInsertDefault} from '../Utils/utils';
import {DevjsiveFunctionVisitor, visitDevjsiveFunction} from './visitors';

export function stabilizeBlockIds(fn: DevjsiveFunction): void {
  const referenced: Set<BlockId> = new Set();
  visitDevjsiveFunction(fn, new CollectReferencedLabels(), referenced);

  const mappings = new Map<BlockId, BlockId>();
  for (const blockId of referenced) {
    mappings.set(blockId, makeBlockId(mappings.size));
  }

  visitDevjsiveFunction(fn, new RewriteBlockIds(), mappings);
}

class CollectReferencedLabels extends DevjsiveFunctionVisitor<Set<BlockId>> {
  override visitScope(scope: DevjsiveScopeBlock, state: Set<BlockId>): void {
    const {earlyReturnValue} = scope.scope;
    if (earlyReturnValue != null) {
      state.add(earlyReturnValue.label);
    }
    this.traverseScope(scope, state);
  }
  override visitTerminal(
    stmt: DevjsiveTerminalStatement,
    state: Set<BlockId>,
  ): void {
    if (stmt.label != null) {
      if (!stmt.label.implicit) {
        state.add(stmt.label.id);
      }
    }
    this.traverseTerminal(stmt, state);
  }
}

class RewriteBlockIds extends DevjsiveFunctionVisitor<Map<BlockId, BlockId>> {
  override visitScope(
    scope: DevjsiveScopeBlock,
    state: Map<BlockId, BlockId>,
  ): void {
    const {earlyReturnValue} = scope.scope;
    if (earlyReturnValue != null) {
      const rewrittenId = getOrInsertDefault(
        state,
        earlyReturnValue.label,
        state.size,
      );
      earlyReturnValue.label = makeBlockId(rewrittenId);
    }
    this.traverseScope(scope, state);
  }
  override visitTerminal(
    stmt: DevjsiveTerminalStatement,
    state: Map<BlockId, BlockId>,
  ): void {
    if (stmt.label != null) {
      const rewrittenId = getOrInsertDefault(state, stmt.label.id, state.size);
      stmt.label.id = makeBlockId(rewrittenId);
    }

    const terminal = stmt.terminal;
    if (terminal.kind === 'break' || terminal.kind === 'continue') {
      const rewrittenId = getOrInsertDefault(
        state,
        terminal.target,
        state.size,
      );
      terminal.target = makeBlockId(rewrittenId);
    }
    this.traverseTerminal(stmt, state);
  }
}
