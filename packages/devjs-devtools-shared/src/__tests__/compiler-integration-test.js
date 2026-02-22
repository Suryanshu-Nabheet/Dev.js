/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {getVersionedRenderImplementation} from './utils';

describe('CompilerIntegration', () => {
  global.IS_devjs_ACT_ENVIRONMENT = true;
  let Devjs;
  let act;
  let useMemoCache;

  beforeEach(() => {
    Devjs = require('devjs');
    require('devjs-dom');
    require('devjs-dom/client');
    useMemoCache = require('devjs/compiler-runtime').c;

    const utils = require('./utils');
    act = utils.act;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const {render} = getVersionedRenderImplementation();

  // @devjsVersion >= 18.2
  it('By default, component display names should not have Forget prefix', () => {
    const hook = global.__devjs_DEVTOOLS_GLOBAL_HOOK__;
    const devjsDOMFiberRendererInterface = hook.rendererInterfaces.get(1);
    expect(devjsDOMFiberRendererInterface).not.toBeFalsy();

    const Foo = () => {
      // eslint-disable-next-line no-unused-vars
      const [val, setVal] = Devjs.useState(null);

      return (
        <div>
          <Bar />
        </div>
      );
    };
    const Bar = () => <div>Hi!</div>;

    act(() => render(<Foo />));

    expect(
      devjsDOMFiberRendererInterface
        .getDisplayNameForElementID(2)
        .indexOf('Forget'),
    ).toBe(-1);
    expect(
      devjsDOMFiberRendererInterface
        .getDisplayNameForElementID(3)
        .indexOf('Forget'),
    ).toBe(-1);
  });

  // For Devjs 18.2, this will install uMC polyfill from devjs-compiler-runtime available on npm.
  // @devjsVersion >= 18.2
  it('If useMemoCache used, the corresponding displayName for a component should have Forget prefix', () => {
    const hook = global.__devjs_DEVTOOLS_GLOBAL_HOOK__;
    const devjsDOMFiberRendererInterface = hook.rendererInterfaces.get(1);
    expect(devjsDOMFiberRendererInterface).not.toBeFalsy();

    const Foo = () => {
      // eslint-disable-next-line no-unused-vars
      const $ = useMemoCache(1);
      // eslint-disable-next-line no-unused-vars
      const [val, setVal] = Devjs.useState(null);

      return (
        <div>
          <Bar />
        </div>
      );
    };
    const Bar = () => <div>Hi!</div>;

    act(() => render(<Foo />));

    // useMemoCache is only used by Foo component
    expect(
      devjsDOMFiberRendererInterface
        .getDisplayNameForElementID(2)
        .indexOf('Forget'),
    ).toBe(0);
    expect(
      devjsDOMFiberRendererInterface
        .getDisplayNameForElementID(3)
        .indexOf('Forget'),
    ).toBe(-1);
  });
});
