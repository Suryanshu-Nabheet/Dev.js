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

const TreeFocusedContext: DevjsContext<boolean> = createContext<boolean>(false);

export default TreeFocusedContext;
