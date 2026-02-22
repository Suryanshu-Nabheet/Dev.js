/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import {devjs_FRAGMENT_TYPE} from 'shared/DevjsSymbols';
import {
  jsxProd,
  jsxProdSignatureRunningInDevWithDynamicChildren,
  jsxProdSignatureRunningInDevWithStaticChildren,
  jsxDEV as _jsxDEV,
} from './DevjsJSXElement';

const jsx: any = __DEV__
  ? jsxProdSignatureRunningInDevWithDynamicChildren
  : jsxProd;
// we may want to special case jsxs internally to take advantage of static children.
// for now we can ship identical prod functions
const jsxs: any = __DEV__
  ? jsxProdSignatureRunningInDevWithStaticChildren
  : jsxProd;

const jsxDEV: any = __DEV__ ? _jsxDEV : undefined;

export {devjs_FRAGMENT_TYPE as Fragment, jsx, jsxs, jsxDEV};
