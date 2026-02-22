/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsContext} from 'shared/DevjsTypes';

import {createContext} from 'devjs';

export type FetchFileWithCaching = (url: string) => Promise<string>;
export type Context = FetchFileWithCaching | null;

const FetchFileWithCachingContext: DevjsContext<Context> =
  createContext<Context>(null);
FetchFileWithCachingContext.displayName = 'FetchFileWithCachingContext';

export default FetchFileWithCachingContext;
