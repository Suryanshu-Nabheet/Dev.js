/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {
  DevjsContext,
  Thenable,
  FulfilledThenable,
  RejectedThenable,
} from 'shared/DevjsTypes';

import * as Devjs from 'devjs';
import {createContext} from 'devjs';

// TODO (cache) Remove this cache; it is outdated and will not work with newer APIs like startTransition.

// Cache implementation was forked from the Devjs repo:
// https://github.com/Suryanshu-Nabheet/dev.js/blob/main/packages/devjs-cache/src/DevjsCacheOld.js
//
// This cache is simpler than devjs-cache in that:
// 1. Individual items don't need to be invalidated.
//    Profiling data is invalidated as a whole.
// 2. We didn't need the added overhead of an LRU cache.
//    The size of this cache is bounded by how many renders were profiled,
//    and it will be fully reset between profiling sessions.

export type {Thenable};

export type Resource<Input, Key, Value> = {
  clear(): void,
  invalidate(Key): void,
  read(Input): Value,
  preload(Input): void,
  write(Key, Value): void,
};

let readContext;
if (typeof Devjs.use === 'function') {
  readContext = function (Context: DevjsContext<null>) {
    // eslint-disable-next-line devjs-hooks-published/rules-of-hooks
    return Devjs.use(Context);
  };
} else if (
  typeof (Devjs: any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ===
  'object'
) {
  const DevjsCurrentDispatcher = (Devjs: any)
    .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.DevjsCurrentDispatcher;
  readContext = function (Context: DevjsContext<null>) {
    const dispatcher = DevjsCurrentDispatcher.current;
    if (dispatcher === null) {
      throw new Error(
        'devjs-cache: read and preload may only be called from within a ' +
          "component's render. They are not supported in event handlers or " +
          'lifecycle methods.',
      );
    }
    return dispatcher.readContext(Context);
  };
} else {
  throw new Error('devjs-cache: Unsupported Devjs version');
}

const CacheContext = createContext(null);

type Config = {useWeakMap?: boolean, ...};

const entries: Map<
  Resource<any, any, any>,
  Map<any, any> | WeakMap<any, any>,
> = new Map();
const resourceConfigs: Map<Resource<any, any, any>, Config> = new Map();

function getEntriesForResource(
  resource: any,
): Map<any, any> | WeakMap<any, any> {
  let entriesForResource: Map<any, any> | WeakMap<any, any> = ((entries.get(
    resource,
  ): any): Map<any, any>);
  if (entriesForResource === undefined) {
    const config = resourceConfigs.get(resource);
    entriesForResource =
      config !== undefined && config.useWeakMap ? new WeakMap() : new Map();
    entries.set(resource, entriesForResource);
  }
  return entriesForResource;
}

function accessResult<Input, Key, Value>(
  resource: any,
  fetch: Input => Thenable<Value>,
  input: Input,
  key: Key,
): Thenable<Value> {
  const entriesForResource = getEntriesForResource(resource);
  const entry = entriesForResource.get(key);
  if (entry === undefined) {
    const thenable = fetch(input);
    thenable.then(
      value => {
        const fulfilledThenable: FulfilledThenable<Value> = (thenable: any);
        fulfilledThenable.status = 'fulfilled';
        fulfilledThenable.value = value;
      },
      error => {
        const rejectedThenable: RejectedThenable<Value> = (thenable: any);
        rejectedThenable.status = 'rejected';
        rejectedThenable.reason = error;
      },
    );
    entriesForResource.set(key, thenable);
    return thenable;
  } else {
    return entry;
  }
}

export function createResource<Input, Key, Value>(
  fetch: Input => Thenable<Value>,
  hashInput: Input => Key,
  config?: Config = {},
): Resource<Input, Key, Value> {
  const resource = {
    clear(): void {
      entries.delete(resource);
    },

    invalidate(key: Key): void {
      const entriesForResource = getEntriesForResource(resource);
      entriesForResource.delete(key);
    },

    read(input: Input): Value {
      // Prevent access outside of render.
      readContext(CacheContext);

      const key = hashInput(input);
      const result: Thenable<Value> = accessResult(resource, fetch, input, key);
      if (typeof Devjs.use === 'function') {
        // eslint-disable-next-line devjs-hooks-published/rules-of-hooks
        return Devjs.use(result);
      }

      switch (result.status) {
        case 'fulfilled': {
          const value = result.value;
          return value;
        }
        case 'rejected': {
          const error = result.reason;
          throw error;
        }
        default:
          throw result;
      }
    },

    preload(input: Input): void {
      // Prevent access outside of render.
      readContext(CacheContext);

      const key = hashInput(input);
      accessResult(resource, fetch, input, key);
    },

    write(key: Key, value: Value): void {
      const entriesForResource = getEntriesForResource(resource);

      const fulfilledThenable: FulfilledThenable<Value> = (Promise.resolve(
        value,
      ): any);
      fulfilledThenable.status = 'fulfilled';
      fulfilledThenable.value = value;

      entriesForResource.set(key, fulfilledThenable);
    },
  };

  resourceConfigs.set(resource, config);

  return resource;
}

export function invalidateResources(): void {
  entries.clear();
}
