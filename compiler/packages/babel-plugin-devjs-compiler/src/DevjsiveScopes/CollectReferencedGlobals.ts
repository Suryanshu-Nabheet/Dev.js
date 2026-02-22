/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visitDevjsiveFunction} from '.';
import {InstructionId, Place, DevjsiveFunction, DevjsiveValue} from '../HIR';
import {DevjsiveFunctionVisitor} from './visitors';

/**
 * Returns a set of unique globals (by name) that are referenced transitively within the function.
 */
export function collectReferencedGlobals(fn: DevjsiveFunction): Set<string> {
  const identifiers = new Set<string>();
  visitDevjsiveFunction(fn, new Visitor(), identifiers);
  return identifiers;
}

class Visitor extends DevjsiveFunctionVisitor<Set<string>> {
  override visitValue(
    id: InstructionId,
    value: DevjsiveValue,
    state: Set<string>,
  ): void {
    this.traverseValue(id, value, state);
    if (value.kind === 'FunctionExpression' || value.kind === 'ObjectMethod') {
      this.visitHirFunction(value.loweredFunc.func, state);
    } else if (value.kind === 'LoadGlobal') {
      state.add(value.binding.name);
    }
  }

  override visitDevjsiveFunctionValue(
    _id: InstructionId,
    _dependencies: Array<Place>,
    fn: DevjsiveFunction,
    state: Set<string>,
  ): void {
    visitDevjsiveFunction(fn, this, state);
  }
}
