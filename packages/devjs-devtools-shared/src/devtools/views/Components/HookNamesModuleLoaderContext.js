/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsContext} from 'shared/DevjsTypes';

import type {Thenable} from 'shared/DevjsTypes';

import {createContext} from 'devjs';
import typeof * as ParseHookNamesModule from 'devjs-devtools-shared/src/hooks/parseHookNames';

export type HookNamesModuleLoaderFunction =
  () => Thenable<ParseHookNamesModule>;
export type Context = HookNamesModuleLoaderFunction | null;

// TODO (Webpack 5) Hopefully we can remove this context entirely once the Webpack 5 upgrade is completed.
const HookNamesModuleLoaderContext: DevjsContext<Context> =
  createContext<Context>(null);
HookNamesModuleLoaderContext.displayName = 'HookNamesModuleLoaderContext';

export default HookNamesModuleLoaderContext;
