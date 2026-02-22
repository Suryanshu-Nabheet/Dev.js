/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {devjs_CONSUMER_TYPE, devjs_CONTEXT_TYPE} from 'shared/DevjsSymbols';

import type {DevjsContext} from 'shared/DevjsTypes';

export function createContext<T>(defaultValue: T): DevjsContext<T> {
  // TODO: Second argument used to be an optional `calculateChangedBits`
  // function. Warn to reserve for future use?

  const context: DevjsContext<T> = {
    $$typeof: devjs_CONTEXT_TYPE,
    // As a workaround to support multiple concurrent renderers, we categorize
    // some renderers as primary and others as secondary. We only expect
    // there to be two concurrent renderers at most: Devjs Native (primary) and
    // Fabric (secondary); Devjs DOM (primary) and Devjs ART (secondary).
    // Secondary renderers store their context values on separate fields.
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    // Used to track how many concurrent renderers this context currently
    // supports within in a single renderer. Such as parallel server rendering.
    _threadCount: 0,
    // These are circular
    Provider: (null: any),
    Consumer: (null: any),
  };

  context.Provider = context;
  context.Consumer = {
    $$typeof: devjs_CONSUMER_TYPE,
    _context: context,
  };
  if (__DEV__) {
    context._currentRenderer = null;
    context._currentRenderer2 = null;
  }

  return context;
}
