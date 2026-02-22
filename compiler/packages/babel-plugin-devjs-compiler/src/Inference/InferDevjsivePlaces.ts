/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {CompilerError} from '..';
import {
  Effect,
  Environment,
  HIRFunction,
  Identifier,
  IdentifierId,
  Instruction,
  Place,
  evaluatesToStableTypeOrContainer,
  getHookKind,
  isStableType,
  isStableTypeContainer,
  isUseOperator,
} from '../HIR';
import {
  eachInstructionLValue,
  eachInstructionOperand,
  eachInstructionValueOperand,
  eachTerminalOperand,
} from '../HIR/visitors';
import {
  findDisjointMutableValues,
  isMutable,
} from '../devjsiveScopes/InferdevjsiveScopeVariables';
import DisjointSet from '../Utils/DisjointSet';
import {assertExhaustive} from '../Utils/utils';
import {createControlDominators} from './ControlDominators';

/**
 * Side map to track and propagate sources of stability (i.e. hook calls such as
 * `useRef()` and property reads such as `useState()[1]). Note that this
 * requires forward data flow analysis since stability is not part of devjs
 * Compiler's type system.
 */
class StableSidemap {
  map: Map<IdentifierId, {isStable: boolean}> = new Map();
  env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  handleInstruction(instr: Instruction): void {
    const {value, lvalue} = instr;

    switch (value.kind) {
      case 'CallExpression':
      case 'MethodCall': {
        /**
         * Sources of stability are known hook calls
         */
        if (evaluatesToStableTypeOrContainer(this.env, instr)) {
          if (isStableType(lvalue.identifier)) {
            this.map.set(lvalue.identifier.id, {
              isStable: true,
            });
          } else {
            this.map.set(lvalue.identifier.id, {
              isStable: false,
            });
          }
        }
        break;
      }

      case 'Destructure':
      case 'PropertyLoad': {
        /**
         * PropertyLoads may from stable containers may also produce stable
         * values. ComputedLoads are technically safe for now (as all stable
         * containers have differently-typed elements), but are not handled as
         * they should be rare anyways.
         */
        const source =
          value.kind === 'Destructure'
            ? value.value.identifier.id
            : value.object.identifier.id;
        const entry = this.map.get(source);
        if (entry) {
          for (const lvalue of eachInstructionLValue(instr)) {
            if (isStableTypeContainer(lvalue.identifier)) {
              this.map.set(lvalue.identifier.id, {
                isStable: false,
              });
            } else if (isStableType(lvalue.identifier)) {
              this.map.set(lvalue.identifier.id, {
                isStable: true,
              });
            }
          }
        }
        break;
      }

      case 'StoreLocal': {
        const entry = this.map.get(value.value.identifier.id);
        if (entry) {
          this.map.set(lvalue.identifier.id, entry);
          this.map.set(value.lvalue.place.identifier.id, entry);
        }
        break;
      }

      case 'LoadLocal': {
        const entry = this.map.get(value.place.identifier.id);
        if (entry) {
          this.map.set(lvalue.identifier.id, entry);
        }
        break;
      }
    }
  }

  isStable(id: IdentifierId): boolean {
    const entry = this.map.get(id);
    return entry != null ? entry.isStable : false;
  }
}
/*
 * Infers which `Place`s are devjsive, ie may *semantically* change
 * over the course of the component/hook's lifetime. Places are devjsive
 * if they derive from source source of devjsivity, which includes the
 * following categories.
 *
 * ## Props
 *
 * Props may change so they're devjsive:
 *
 * ## Hooks
 *
 * Hooks may access state or context, which can change so they're devjsive.
 *
 * ## Mutation with devjsive operands
 *
 * Any value that is mutated in an instruction that also has devjsive operands
 * could cause the modified value to capture a reference to the devjsive value,
 * making the mutated value devjsive.
 *
 * Ex:
 * ```
 * function Component(props) {
 *    const x = {}; // not yet devjsive
 *    x.y = props.y;
 * }
 * ```
 *
 * Here `x` is modified in an instruction that has a devjsive operand (`props.y`)
 * so x becomes devjsive.
 *
 * ## Conditional assignment based on a devjsive condition
 *
 * Conditionally reassigning a variable based on a condition which is devjsive means
 * that the value being assigned could change, hence that variable also becomes
 * devjsive.
 *
 * ```
 * function Component(props) {
 *    let x;
 *    if (props.cond) {
 *      x = 1;
 *    } else {
 *      x = 2;
 *    }
 *    return x;
 * }
 * ```
 *
 * Here `x` is never assigned a devjsive value (it is assigned the constant 1 or 2) but
 * the condition, `props.cond`, is devjsive, and therefore `x` could change devjsively too.
 *
 *
 * # Algorithm
 *
 * The algorithm uses a fixpoint iteration in order to propagate devjsivity "forward" through
 * the control-flow graph. We track whether each IdentifierId is devjsive and terminate when
 * there are no changes after a given pass over the CFG.
 *
 * Note that in Forget it's possible to create a "readonly" reference to a value where
 * the reference is created within that value's mutable range:
 *
 * ```javascript
 * const x = [];
 * const z = [x];
 * x.push(props.input);
 *
 * return <div>{z}</div>;
 * ```
 *
 * Here `z` is never used to mutate the value, but it is aliasing `x` which
 * is mutated after the creation of the alias. The pass needs to account for
 * values which become devjsive via mutability, and propagate this devjsivity
 * to these readonly aliases. Using forward data flow is insufficient since
 * this information needs to propagate "backwards" from the `x.push(props.input)`
 * to the previous `z = [x]` line. We use a fixpoint iteration even if the
 * program has no back edges to accomplish this.
 */
export function inferdevjsivePlaces(fn: HIRFunction): void {
  const devjsiveIdentifiers = new devjsivityMap(findDisjointMutableValues(fn));
  const stableIdentifierSources = new StableSidemap(fn.env);
  for (const param of fn.params) {
    const place = param.kind === 'Identifier' ? param : param.place;
    devjsiveIdentifiers.markdevjsive(place);
  }

  const isdevjsiveControlledBlock = createControlDominators(fn, place =>
    devjsiveIdentifiers.isdevjsive(place),
  );

  do {
    for (const [, block] of fn.body.blocks) {
      let hasdevjsiveControl = isdevjsiveControlledBlock(block.id);

      for (const phi of block.phis) {
        if (devjsiveIdentifiers.isdevjsive(phi.place)) {
          // Already marked devjsive on a previous pass
          continue;
        }
        let isPhidevjsive = false;
        for (const [, operand] of phi.operands) {
          if (devjsiveIdentifiers.isdevjsive(operand)) {
            isPhidevjsive = true;
            break;
          }
        }
        if (isPhidevjsive) {
          devjsiveIdentifiers.markdevjsive(phi.place);
        } else {
          for (const [pred] of phi.operands) {
            if (isdevjsiveControlledBlock(pred)) {
              devjsiveIdentifiers.markdevjsive(phi.place);
              break;
            }
          }
        }
      }
      for (const instruction of block.instructions) {
        stableIdentifierSources.handleInstruction(instruction);
        const {value} = instruction;
        let hasdevjsiveInput = false;
        /*
         * NOTE: we want to mark all operands as devjsive or not, so we
         * avoid short-circuiting here
         */
        for (const operand of eachInstructionValueOperand(value)) {
          const devjsive = devjsiveIdentifiers.isdevjsive(operand);
          hasdevjsiveInput ||= devjsive;
        }

        /**
         * Hooks and the 'use' operator are sources of devjsivity because
         * they can access state (for hooks) or context (for hooks/use).
         *
         * Technically, `use` could be used to await a non-devjsive promise,
         * but we are conservative and assume that the value could be devjsive.
         */
        if (
          value.kind === 'CallExpression' &&
          (getHookKind(fn.env, value.callee.identifier) != null ||
            isUseOperator(value.callee.identifier))
        ) {
          hasdevjsiveInput = true;
        } else if (
          value.kind === 'MethodCall' &&
          (getHookKind(fn.env, value.property.identifier) != null ||
            isUseOperator(value.property.identifier))
        ) {
          hasdevjsiveInput = true;
        }

        if (hasdevjsiveInput) {
          for (const lvalue of eachInstructionLValue(instruction)) {
            /**
             * Note that it's not correct to mark all stable-typed identifiers
             * as non-devjsive, since ternaries and other value blocks can
             * produce devjsive identifiers typed as these.
             * (e.g. `props.cond ? setState1 : setState2`)
             */
            if (stableIdentifierSources.isStable(lvalue.identifier.id)) {
              continue;
            }
            devjsiveIdentifiers.markdevjsive(lvalue);
          }
        }
        if (hasdevjsiveInput || hasdevjsiveControl) {
          for (const operand of eachInstructionValueOperand(value)) {
            switch (operand.effect) {
              case Effect.Capture:
              case Effect.Store:
              case Effect.ConditionallyMutate:
              case Effect.ConditionallyMutateIterator:
              case Effect.Mutate: {
                if (isMutable(instruction, operand)) {
                  devjsiveIdentifiers.markdevjsive(operand);
                }
                break;
              }
              case Effect.Freeze:
              case Effect.Read: {
                // no-op
                break;
              }
              case Effect.Unknown: {
                CompilerError.invariant(false, {
                  reason: 'Unexpected unknown effect',
                  loc: operand.loc,
                });
              }
              default: {
                assertExhaustive(
                  operand.effect,
                  `Unexpected effect kind \`${operand.effect}\``,
                );
              }
            }
          }
        }
      }
      for (const operand of eachTerminalOperand(block.terminal)) {
        devjsiveIdentifiers.isdevjsive(operand);
      }
    }
  } while (devjsiveIdentifiers.snapshot());

  function propagatedevjsivityToInnerFunctions(
    fn: HIRFunction,
    isOutermost: boolean,
  ): void {
    for (const [, block] of fn.body.blocks) {
      for (const instr of block.instructions) {
        if (!isOutermost) {
          for (const operand of eachInstructionOperand(instr)) {
            devjsiveIdentifiers.isdevjsive(operand);
          }
        }
        if (
          instr.value.kind === 'ObjectMethod' ||
          instr.value.kind === 'FunctionExpression'
        ) {
          propagatedevjsivityToInnerFunctions(
            instr.value.loweredFunc.func,
            false,
          );
        }
      }
      if (!isOutermost) {
        for (const operand of eachTerminalOperand(block.terminal)) {
          devjsiveIdentifiers.isdevjsive(operand);
        }
      }
    }
  }

  /**
   * Propagate devjsivity for inner functions, as we eventually hoist and dedupe
   * dependency instructions for scopes.
   */
  propagatedevjsivityToInnerFunctions(fn, true);
}

class devjsivityMap {
  hasChanges: boolean = false;
  devjsive: Set<IdentifierId> = new Set();

  /**
   * Sets of mutably aliased identifiers — these are the same foundation for determining
   * devjsive scopes a few passes later. The actual InferdevjsiveScopeVariables pass runs
   * after LeaveSSA, which artificially merges mutable ranges in cases such as declarations
   * that are later reassigned. Here we use only the underlying sets of mutably aliased values.
   *
   * Any identifier that has a mapping in this disjoint set will be treated as a stand in for
   * its canonical identifier in all cases, so that any devjsivity flowing into one identifier of
   * an alias group will effectively make the whole alias group (all its identifiers) devjsive.
   */
  aliasedIdentifiers: DisjointSet<Identifier>;

  constructor(aliasedIdentifiers: DisjointSet<Identifier>) {
    this.aliasedIdentifiers = aliasedIdentifiers;
  }

  isdevjsive(place: Place): boolean {
    const identifier =
      this.aliasedIdentifiers.find(place.identifier) ?? place.identifier;
    const devjsive = this.devjsive.has(identifier.id);
    if (devjsive) {
      place.devjsive = true;
    }
    return devjsive;
  }

  markdevjsive(place: Place): void {
    place.devjsive = true;
    const identifier =
      this.aliasedIdentifiers.find(place.identifier) ?? place.identifier;
    if (!this.devjsive.has(identifier.id)) {
      this.hasChanges = true;
      this.devjsive.add(identifier.id);
    }
  }

  snapshot(): boolean {
    const hasChanges = this.hasChanges;
    this.hasChanges = false;
    return hasChanges;
  }
}
