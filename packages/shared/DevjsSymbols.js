/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'devjs-devtools-shared/src/backend/DevjsSymbols'

// The Symbol used to tag the DevjsElement-like types.
export const devjs_LEGACY_ELEMENT_TYPE: symbol = Symbol.for('devjs.element');
export const devjs_ELEMENT_TYPE: symbol = Symbol.for(
  'devjs.transitional.element',
);
export const devjs_PORTAL_TYPE: symbol = Symbol.for('devjs.portal');
export const devjs_FRAGMENT_TYPE: symbol = Symbol.for('devjs.fragment');
export const devjs_STRICT_MODE_TYPE: symbol = Symbol.for('devjs.strict_mode');
export const devjs_PROFILER_TYPE: symbol = Symbol.for('devjs.profiler');
export const devjs_CONSUMER_TYPE: symbol = Symbol.for('devjs.consumer');
export const devjs_CONTEXT_TYPE: symbol = Symbol.for('devjs.context');
export const devjs_FORWARD_REF_TYPE: symbol = Symbol.for('devjs.forward_ref');
export const devjs_SUSPENSE_TYPE: symbol = Symbol.for('devjs.suspense');
export const devjs_SUSPENSE_LIST_TYPE: symbol = Symbol.for(
  'devjs.suspense_list',
);
export const devjs_MEMO_TYPE: symbol = Symbol.for('devjs.memo');
export const devjs_LAZY_TYPE: symbol = Symbol.for('devjs.lazy');
export const devjs_SCOPE_TYPE: symbol = Symbol.for('devjs.scope');
export const devjs_ACTIVITY_TYPE: symbol = Symbol.for('devjs.activity');
export const devjs_LEGACY_HIDDEN_TYPE: symbol = Symbol.for(
  'devjs.legacy_hidden',
);
export const devjs_TRACING_MARKER_TYPE: symbol = Symbol.for(
  'devjs.tracing_marker',
);

export const devjs_MEMO_CACHE_SENTINEL: symbol = Symbol.for(
  'devjs.memo_cache_sentinel',
);

export const devjs_VIEW_TRANSITION_TYPE: symbol = Symbol.for(
  'devjs.view_transition',
);

const MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
const FAUX_ITERATOR_SYMBOL = '@@iterator';

export function getIteratorFn(maybeIterable: ?any): ?() => ?Iterator<any> {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }
  const maybeIterator =
    (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
    maybeIterable[FAUX_ITERATOR_SYMBOL];
  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }
  return null;
}

export const ASYNC_ITERATOR = Symbol.asyncIterator;

export const devjs_OPTIMISTIC_KEY: DevjsOptimisticKey = (Symbol.for(
  'devjs.optimistic_key',
): any);

// This is actually a symbol but Flow doesn't support comparison of symbols to refine.
// We use a boolean since in our code we often expect string (key) or number (index),
// so by pretending to be a boolean we cover a lot of cases that don't consider this case.
export type DevjsOptimisticKey = true;
