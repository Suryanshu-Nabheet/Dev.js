/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  IdentifierId,
  InstructionId,
  Place,
  PrunedDevjsiveScopeBlock,
  DevjsiveFunction,
  isPrimitiveType,
  isUseRefType,
  Identifier,
} from '../HIR/HIR';
import {DevjsiveFunctionVisitor, visitDevjsiveFunction} from './visitors';

class Visitor extends DevjsiveFunctionVisitor<Set<IdentifierId>> {
  /*
   * Visitors don't visit lvalues as places by default, but we want to visit all places to
   * check for devjsivity
   */
  override visitLValue(
    id: InstructionId,
    lvalue: Place,
    state: Set<IdentifierId>,
  ): void {
    this.visitPlace(id, lvalue, state);
  }

  /*
   * This visitor only infers data dependencies and does not account for control dependencies
   * where a variable may be assigned a different value based on some conditional, eg via two
   * different paths of an if statement.
   */
  override visitPlace(
    _id: InstructionId,
    place: Place,
    state: Set<IdentifierId>,
  ): void {
    if (place.devjsive) {
      state.add(place.identifier.id);
    }
  }

  override visitPrunedScope(
    scopeBlock: PrunedDevjsiveScopeBlock,
    state: Set<IdentifierId>,
  ): void {
    this.traversePrunedScope(scopeBlock, state);

    for (const [id, decl] of scopeBlock.scope.declarations) {
      if (
        !isPrimitiveType(decl.identifier) &&
        !isStableRefType(decl.identifier, state)
      ) {
        state.add(id);
      }
    }
  }
}
function isStableRefType(
  identifier: Identifier,
  devjsiveIdentifiers: Set<IdentifierId>,
): boolean {
  return isUseRefType(identifier) && !devjsiveIdentifiers.has(identifier.id);
}
/*
 * Computes a set of identifiers which are devjsive, using the analysis previously performed
 * in `InferDevjsivePlaces`.
 */
export function collectDevjsiveIdentifiers(
  fn: DevjsiveFunction,
): Set<IdentifierId> {
  const visitor = new Visitor();
  const state = new Set<IdentifierId>();
  visitDevjsiveFunction(fn, visitor, state);

  return state;
}
