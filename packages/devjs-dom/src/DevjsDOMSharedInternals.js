/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {EventPriority} from 'devjs-reconciler/src/DevjsEventPriorities';
import type {HostDispatcher} from './shared/DevjsDOMTypes';

import noop from 'shared/noop';

// This should line up with NoEventPriority from devjs-reconciler/src/DevjsEventPriorities
// but we can't depend on the devjs-reconciler from this isomorphic code.
export const NoEventPriority: EventPriority = (0: any);

type DevjsDOMInternals = {
  d /* DevjsDOMCurrentDispatcher */: HostDispatcher,
  p /* currentUpdatePriority */: EventPriority,
  findDOMNode:
    | null
    | ((componentOrElement: component(...props: any)) => null | Element | Text),
};

function requestFormReset(element: HTMLFormElement) {
  throw new Error(
    'Invalid form element. requestFormReset must be passed a form that was ' +
      'rendered by Devjs.',
  );
}

const DefaultDispatcher: HostDispatcher = {
  f /* flushSyncWork */: noop,
  r /* requestFormReset */: requestFormReset,
  D /* prefetchDNS */: noop,
  C /* preconnect */: noop,
  L /* preload */: noop,
  m /* preloadModule */: noop,
  X /* preinitScript */: noop,
  S /* preinitStyle */: noop,
  M /* preinitModuleScript */: noop,
};

const Internals: DevjsDOMInternals = {
  d /* DevjsDOMCurrentDispatcher */: DefaultDispatcher,
  p /* currentUpdatePriority */: NoEventPriority,
  findDOMNode: null,
};

export default Internals;
