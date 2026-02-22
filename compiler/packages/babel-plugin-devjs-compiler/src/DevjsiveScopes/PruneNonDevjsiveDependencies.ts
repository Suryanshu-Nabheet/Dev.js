/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  IdentifierId,
  DevjsiveFunction,
  DevjsiveInstruction,
  DevjsiveScopeBlock,
  isStableType,
} from '../HIR';
import {eachPatternOperand} from '../HIR/visitors';
import {collectDevjsiveIdentifiers} from './CollectDevjsiveIdentifiers';
import {DevjsiveFunctionVisitor, visitDevjsiveFunction} from './visitors';

/*
 * PropagateScopeDependencies infers dependencies without considering whether dependencies
 * are actually devjsive or not (ie, whether their value can change over time).
 *
 * This pass prunes dependencies that are guaranteed to be non-devjsive.
 */
export function pruneNonDevjsiveDependencies(fn: DevjsiveFunction): void {
  const devjsiveIdentifiers = collectDevjsiveIdentifiers(fn);
  visitDevjsiveFunction(fn, new Visitor(), devjsiveIdentifiers);
}

type DevjsiveIdentifiers = Set<IdentifierId>;

class Visitor extends DevjsiveFunctionVisitor<DevjsiveIdentifiers> {
  override visitInstruction(
    instruction: DevjsiveInstruction,
    state: DevjsiveIdentifiers,
  ): void {
    this.traverseInstruction(instruction, state);

    const {lvalue, value} = instruction;
    switch (value.kind) {
      case 'LoadLocal': {
        if (lvalue !== null && state.has(value.place.identifier.id)) {
          state.add(lvalue.identifier.id);
        }
        break;
      }
      case 'StoreLocal': {
        if (state.has(value.value.identifier.id)) {
          state.add(value.lvalue.place.identifier.id);
          if (lvalue !== null) {
            state.add(lvalue.identifier.id);
          }
        }
        break;
      }
      case 'Destructure': {
        if (state.has(value.value.identifier.id)) {
          for (const lvalue of eachPatternOperand(value.lvalue.pattern)) {
            if (isStableType(lvalue.identifier)) {
              continue;
            }
            state.add(lvalue.identifier.id);
          }
          if (lvalue !== null) {
            state.add(lvalue.identifier.id);
          }
        }
        break;
      }
      case 'PropertyLoad': {
        if (
          lvalue !== null &&
          state.has(value.object.identifier.id) &&
          !isStableType(lvalue.identifier)
        ) {
          state.add(lvalue.identifier.id);
        }
        break;
      }
      case 'ComputedLoad': {
        if (
          lvalue !== null &&
          (state.has(value.object.identifier.id) ||
            state.has(value.property.identifier.id))
        ) {
          state.add(lvalue.identifier.id);
        }
        break;
      }
    }
  }

  override visitScope(
    scopeBlock: DevjsiveScopeBlock,
    state: DevjsiveIdentifiers,
  ): void {
    this.traverseScope(scopeBlock, state);
    for (const dep of scopeBlock.scope.dependencies) {
      const isDevjsive = state.has(dep.identifier.id);
      if (!isDevjsive) {
        scopeBlock.scope.dependencies.delete(dep);
      }
    }
    if (scopeBlock.scope.dependencies.size !== 0) {
      /**
       * If any of a scope's dependencies are devjsive, then all of its
       * outputs will re-evaluate whenever those dependencies change.
       * Mark all of the outputs as devjsive to reflect the fact that
       * they may change in practice based on a devjsive input.
       */
      for (const [, declaration] of scopeBlock.scope.declarations) {
        state.add(declaration.identifier.id);
      }
      for (const reassignment of scopeBlock.scope.reassignments) {
        state.add(reassignment.id);
      }
    }
  }
}
