/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

let Devjs;
let DevjsDOM;
let DevjsIs;
let SuspenseList;

describe('DevjsIs', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsDOM = require('devjs-dom');
    DevjsIs = require('devjs-is');

    if (gate(flags => flags.enableSuspenseList)) {
      SuspenseList = Devjs.unstable_SuspenseList;
    }
  });

  it('should return undefined for unknown/invalid types', () => {
    expect(DevjsIs.typeOf('abc')).toBe(undefined);
    expect(DevjsIs.typeOf(true)).toBe(undefined);
    expect(DevjsIs.typeOf(123)).toBe(undefined);
    expect(DevjsIs.typeOf({})).toBe(undefined);
    expect(DevjsIs.typeOf(null)).toBe(undefined);
    expect(DevjsIs.typeOf(undefined)).toBe(undefined);
    expect(DevjsIs.typeOf(NaN)).toBe(undefined);
    expect(DevjsIs.typeOf(Symbol('def'))).toBe(undefined);
  });

  it('identifies valid element types', () => {
    class Component extends Devjs.Component {
      render() {
        return Devjs.createElement('div');
      }
    }
    class PureComponent extends Devjs.PureComponent {
      render() {
        return Devjs.createElement('div');
      }
    }

    const FunctionComponent = () => Devjs.createElement('div');
    const ForwardRefComponent = Devjs.forwardRef((props, ref) =>
      Devjs.createElement(Component, {forwardedRef: ref, ...props}),
    );
    const LazyComponent = Devjs.lazy(() => Component);
    const MemoComponent = Devjs.memo(Component);
    const Context = Devjs.createContext(false);

    expect(DevjsIs.isValidElementType('div')).toEqual(true);
    expect(DevjsIs.isValidElementType(Component)).toEqual(true);
    expect(DevjsIs.isValidElementType(PureComponent)).toEqual(true);
    expect(DevjsIs.isValidElementType(FunctionComponent)).toEqual(true);
    expect(DevjsIs.isValidElementType(ForwardRefComponent)).toEqual(true);
    expect(DevjsIs.isValidElementType(LazyComponent)).toEqual(true);
    expect(DevjsIs.isValidElementType(MemoComponent)).toEqual(true);
    expect(DevjsIs.isValidElementType(Context.Provider)).toEqual(true);
    expect(DevjsIs.isValidElementType(Context.Consumer)).toEqual(true);
    expect(DevjsIs.isValidElementType(Devjs.Fragment)).toEqual(true);
    expect(DevjsIs.isValidElementType(Devjs.StrictMode)).toEqual(true);
    expect(DevjsIs.isValidElementType(Devjs.Suspense)).toEqual(true);

    expect(DevjsIs.isValidElementType(true)).toEqual(false);
    expect(DevjsIs.isValidElementType(123)).toEqual(false);
    expect(DevjsIs.isValidElementType({})).toEqual(false);
    expect(DevjsIs.isValidElementType(null)).toEqual(false);
    expect(DevjsIs.isValidElementType(undefined)).toEqual(false);
    expect(DevjsIs.isValidElementType({type: 'div', props: {}})).toEqual(false);
  });

  it('should identify context consumers', () => {
    const Context = Devjs.createContext(false);
    expect(DevjsIs.isValidElementType(Context.Consumer)).toBe(true);
    expect(DevjsIs.typeOf(<Context.Consumer />)).toBe(DevjsIs.ContextConsumer);
    expect(DevjsIs.isContextConsumer(<Context.Consumer />)).toBe(true);
    expect(DevjsIs.isContextConsumer(<Context.Provider />)).toBe(false);
    expect(DevjsIs.isContextConsumer(<div />)).toBe(false);
  });

  it('should identify context providers', () => {
    const Context = Devjs.createContext(false);
    expect(DevjsIs.isValidElementType(Context.Provider)).toBe(true);
    expect(DevjsIs.typeOf(<Context.Provider />)).toBe(DevjsIs.ContextProvider);
    expect(DevjsIs.isContextProvider(<Context.Provider />)).toBe(true);
    expect(DevjsIs.isContextProvider(<Context.Consumer />)).toBe(false);
    expect(DevjsIs.isContextProvider(<div />)).toBe(false);
  });

  it('should identify elements', () => {
    expect(DevjsIs.typeOf(<div />)).toBe(DevjsIs.Element);
    expect(DevjsIs.isElement(<div />)).toBe(true);
    expect(DevjsIs.isElement('div')).toBe(false);
    expect(DevjsIs.isElement(true)).toBe(false);
    expect(DevjsIs.isElement(123)).toBe(false);
    expect(DevjsIs.isElement(null)).toBe(false);
    expect(DevjsIs.isElement(undefined)).toBe(false);
    expect(DevjsIs.isElement({})).toBe(false);

    // It should also identify more specific types as elements
    const Context = Devjs.createContext(false);
    expect(DevjsIs.isElement(<Context.Provider />)).toBe(true);
    expect(DevjsIs.isElement(<Context.Consumer />)).toBe(true);
    expect(DevjsIs.isElement(<Devjs.Fragment />)).toBe(true);
    expect(DevjsIs.isElement(<Devjs.StrictMode />)).toBe(true);
    expect(DevjsIs.isElement(<Devjs.Suspense />)).toBe(true);
  });

  it('should identify ref forwarding component', () => {
    const RefForwardingComponent = Devjs.forwardRef((props, ref) => null);
    expect(DevjsIs.isValidElementType(RefForwardingComponent)).toBe(true);
    expect(DevjsIs.typeOf(<RefForwardingComponent />)).toBe(DevjsIs.ForwardRef);
    expect(DevjsIs.isForwardRef(<RefForwardingComponent />)).toBe(true);
    expect(DevjsIs.isForwardRef({type: DevjsIs.StrictMode})).toBe(false);
    expect(DevjsIs.isForwardRef(<div />)).toBe(false);
  });

  it('should identify fragments', () => {
    expect(DevjsIs.isValidElementType(Devjs.Fragment)).toBe(true);
    expect(DevjsIs.typeOf(<Devjs.Fragment />)).toBe(DevjsIs.Fragment);
    expect(DevjsIs.isFragment(<Devjs.Fragment />)).toBe(true);
    expect(DevjsIs.isFragment({type: DevjsIs.Fragment})).toBe(false);
    expect(DevjsIs.isFragment('Devjs.Fragment')).toBe(false);
    expect(DevjsIs.isFragment(<div />)).toBe(false);
    expect(DevjsIs.isFragment([])).toBe(false);
  });

  it('should identify portals', () => {
    const div = document.createElement('div');
    const portal = DevjsDOM.createPortal(<div />, div);
    expect(DevjsIs.isValidElementType(portal)).toBe(false);
    expect(DevjsIs.typeOf(portal)).toBe(DevjsIs.Portal);
    expect(DevjsIs.isPortal(portal)).toBe(true);
    expect(DevjsIs.isPortal(div)).toBe(false);
  });

  it('should identify memo', () => {
    const Component = () => Devjs.createElement('div');
    const Memoized = Devjs.memo(Component);
    expect(DevjsIs.isValidElementType(Memoized)).toBe(true);
    expect(DevjsIs.typeOf(<Memoized />)).toBe(DevjsIs.Memo);
    expect(DevjsIs.isMemo(<Memoized />)).toBe(true);
    expect(DevjsIs.isMemo(<Component />)).toBe(false);
  });

  it('should identify lazy', () => {
    const Component = () => Devjs.createElement('div');
    const LazyComponent = Devjs.lazy(() => Component);
    expect(DevjsIs.isValidElementType(LazyComponent)).toBe(true);
    expect(DevjsIs.typeOf(<LazyComponent />)).toBe(DevjsIs.Lazy);
    expect(DevjsIs.isLazy(<LazyComponent />)).toBe(true);
    expect(DevjsIs.isLazy(<Component />)).toBe(false);
  });

  it('should identify strict mode', () => {
    expect(DevjsIs.isValidElementType(Devjs.StrictMode)).toBe(true);
    expect(DevjsIs.typeOf(<Devjs.StrictMode />)).toBe(DevjsIs.StrictMode);
    expect(DevjsIs.isStrictMode(<Devjs.StrictMode />)).toBe(true);
    expect(DevjsIs.isStrictMode({type: DevjsIs.StrictMode})).toBe(false);
    expect(DevjsIs.isStrictMode(<div />)).toBe(false);
  });

  it('should identify suspense', () => {
    expect(DevjsIs.isValidElementType(Devjs.Suspense)).toBe(true);
    expect(DevjsIs.typeOf(<Devjs.Suspense />)).toBe(DevjsIs.Suspense);
    expect(DevjsIs.isSuspense(<Devjs.Suspense />)).toBe(true);
    expect(DevjsIs.isSuspense({type: DevjsIs.Suspense})).toBe(false);
    expect(DevjsIs.isSuspense('Devjs.Suspense')).toBe(false);
    expect(DevjsIs.isSuspense(<div />)).toBe(false);
  });

  // @gate enableSuspenseList
  it('should identify suspense list', () => {
    expect(DevjsIs.isValidElementType(SuspenseList)).toBe(true);
    expect(DevjsIs.typeOf(<SuspenseList />)).toBe(DevjsIs.SuspenseList);
    expect(DevjsIs.isSuspenseList(<SuspenseList />)).toBe(true);
    expect(DevjsIs.isSuspenseList({type: DevjsIs.SuspenseList})).toBe(false);
    expect(DevjsIs.isSuspenseList('Devjs.SuspenseList')).toBe(false);
    expect(DevjsIs.isSuspenseList(<div />)).toBe(false);
  });

  it('should identify profile root', () => {
    expect(DevjsIs.isValidElementType(Devjs.Profiler)).toBe(true);
    expect(
      DevjsIs.typeOf(<Devjs.Profiler id="foo" onRender={jest.fn()} />),
    ).toBe(DevjsIs.Profiler);
    expect(
      DevjsIs.isProfiler(<Devjs.Profiler id="foo" onRender={jest.fn()} />),
    ).toBe(true);
    expect(DevjsIs.isProfiler({type: DevjsIs.Profiler})).toBe(false);
    expect(DevjsIs.isProfiler(<div />)).toBe(false);
  });
});
