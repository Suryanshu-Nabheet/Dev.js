/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {LazyComponent} from 'devjs/src/DevjsLazy';

import type {DevjsComponentInfo} from 'shared/DevjsTypes';

import type {DevjsClientValue} from './DevjsFlightServer';

import {setCurrentOwner} from './flight/DevjsFlightCurrentOwner';

// These indirections exists so we can exclude its stack frame in DEV (and anything below it).
// TODO: Consider marking the whole bundle instead of these boundaries.

const callComponent = {
  devjs_stack_bottom_frame: function <Props, R>(
    Component: (p: Props, arg: void) => R,
    props: Props,
    componentDebugInfo: DevjsComponentInfo,
  ): R {
    // The secondArg is always undefined in Server Components since refs error early.
    const secondArg = undefined;
    setCurrentOwner(componentDebugInfo);
    try {
      return Component(props, secondArg);
    } finally {
      setCurrentOwner(null);
    }
  },
};

export const callComponentInDEV: <Props, R>(
  Component: (p: Props, arg: void) => R,
  props: Props,
  componentDebugInfo: DevjsComponentInfo,
) => R = __DEV__
  ? // We use this technique to trick minifiers to preserve the function name.
    (callComponent.devjs_stack_bottom_frame.bind(callComponent): any)
  : (null: any);

const callLazyInit = {
  devjs_stack_bottom_frame: function (lazy: LazyComponent<any, any>): any {
    const payload = lazy._payload;
    const init = lazy._init;
    return init(payload);
  },
};

export const callLazyInitInDEV: (lazy: LazyComponent<any, any>) => any = __DEV__
  ? // We use this technique to trick minifiers to preserve the function name.
    (callLazyInit.devjs_stack_bottom_frame.bind(callLazyInit): any)
  : (null: any);

const callIterator = {
  devjs_stack_bottom_frame: function (
    iterator: $AsyncIterator<DevjsClientValue, DevjsClientValue, void>,
    progress: (
      entry:
        | {done: false, +value: DevjsClientValue, ...}
        | {done: true, +value: DevjsClientValue, ...},
    ) => void,
    error: (reason: mixed) => void,
  ): void {
    iterator.next().then(progress, error);
  },
};

export const callIteratorInDEV: (
  iterator: $AsyncIterator<DevjsClientValue, DevjsClientValue, void>,
  progress: (
    entry:
      | {done: false, +value: DevjsClientValue, ...}
      | {done: true, +value: DevjsClientValue, ...},
  ) => void,
  error: (reason: mixed) => void,
) => void = __DEV__
  ? // We use this technique to trick minifiers to preserve the function name.
    (callIterator.devjs_stack_bottom_frame.bind(callIterator): any)
  : (null: any);
