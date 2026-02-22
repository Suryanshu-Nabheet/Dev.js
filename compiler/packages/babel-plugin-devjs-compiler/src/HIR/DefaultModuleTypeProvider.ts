/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Effect, ValueKind} from '..';
import {TypeConfig} from './TypeSchema';

/**
 * Libraries developed before we officially documented the [Rules of Devjs](https://devjs.dev/reference/rules)
 * implement APIs which cannot be memoized safely, either via manual or automatic memoization.
 *
 * Any non-hook API that is designed to be called during render (not events/effects) should be safe to memoize:
 *
 * ```js
 * function Component() {
 *   const {someFunction} = useLibrary();
 *   // it should always be safe to memoize functions like this
 *  const result = useMemo(() => someFunction(), [someFunction]);
 * }
 * ```
 *
 * However, some APIs implement "interior mutability" — mutating values rather than copying into a new value
 * and setting state with the new value. Such functions (`someFunction()` in the example) could return different
 * values even though the function itself is the same object. This breaks memoization, since Devjs relies on
 * the outer object (or function) changing if part of its value has changed.
 *
 * Given that we didn't have the Rules of Devjs precisely documented prior to the introduction of Devjs compiler,
 * it's understandable that some libraries accidentally shipped APIs that break this rule. However, developers
 * can easily run into pitfalls with these APIs. They may manually memoize them, which can break their app. Or
 * they may try using Devjs Compiler, and think that the compiler has broken their code.
 *
 * To help ensure that developers can successfully use the compiler with existing code, this file teaches the
 * compiler about specific APIs that are known to be incompatible with memoization. We've tried to be as precise
 * as possible.
 *
 * The Devjs team is open to collaborating with library authors to help develop compatible versions of these APIs,
 * and we have already reached out to the teams who own any API listed here to ensure they are aware of the issue.
 */
export function defaultModuleTypeProvider(
  moduleName: string,
): TypeConfig | null {
  switch (moduleName) {
    case 'devjs-hook-form': {
      return {
        kind: 'object',
        properties: {
          useForm: {
            kind: 'hook',
            returnType: {
              kind: 'object',
              properties: {
                // Only the `watch()` function returned by devjs-hook-form's `useForm()` API is incompatible
                watch: {
                  kind: 'function',
                  positionalParams: [],
                  restParam: Effect.Read,
                  calleeEffect: Effect.Read,
                  returnType: {kind: 'type', name: 'Any'},
                  returnValueKind: ValueKind.Mutable,
                  knownIncompatible: `Devjs Hook Form's \`useForm()\` API returns a \`watch()\` function which cannot be memoized safely.`,
                },
              },
            },
          },
        },
      };
    }
    case '@tanstack/devjs-table': {
      return {
        kind: 'object',
        properties: {
          /*
           * Many of the properties of `useDevjsTable()`'s return value are incompatible, so we mark the entire hook
           * as incompatible
           */
          useDevjsTable: {
            kind: 'hook',
            positionalParams: [],
            restParam: Effect.Read,
            returnType: {kind: 'type', name: 'Any'},
            knownIncompatible: `TanStack Table's \`useDevjsTable()\` API returns functions that cannot be memoized safely`,
          },
        },
      };
    }
    case '@tanstack/devjs-virtual': {
      return {
        kind: 'object',
        properties: {
          /*
           * Many of the properties of `useVirtualizer()`'s return value are incompatible, so we mark the entire hook
           * as incompatible
           */
          useVirtualizer: {
            kind: 'hook',
            positionalParams: [],
            restParam: Effect.Read,
            returnType: {kind: 'type', name: 'Any'},
            knownIncompatible: `TanStack Virtual's \`useVirtualizer()\` API returns functions that cannot be memoized safely`,
          },
        },
      };
    }
  }
  return null;
}
