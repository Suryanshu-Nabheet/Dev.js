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

import {NoEventPriority} from 'devjs-reconciler/src/DevjsEventPriorities';

import noop from 'shared/noop';

type DevjsDOMInternals = {
  Events: [any, any, any, any, any, any],
  d /* DevjsDOMCurrentDispatcher */: HostDispatcher,
  p /* currentUpdatePriority */: EventPriority,
  findDOMNode:
    | null
    | ((componentOrElement: component(...props: any)) => null | Element | Text),
};

const DefaultDispatcher: HostDispatcher = {
  f /* flushSyncWork */: noop,
  r /* requestFormReset */: noop,
  D /* prefetchDNS */: noop,
  C /* preconnect */: noop,
  L /* preload */: noop,
  m /* preloadModule */: noop,
  X /* preinitScript */: noop,
  S /* preinitStyle */: noop,
  M /* preinitModuleScript */: noop,
};

const Internals: DevjsDOMInternals = {
  Events: (null: any),
  d /* DevjsDOMCurrentDispatcher */: DefaultDispatcher,
  p /* currentUpdatePriority */: NoEventPriority,
  findDOMNode: null,
};

export default Internals;
