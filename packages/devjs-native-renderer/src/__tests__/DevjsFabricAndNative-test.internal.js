/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 * @jest-environment node
 */

'use strict';

let Devjs;
let DevjsFabric;
let DevjsNative;
let UIManager;
let createDevjsNativeComponentClass;
let DevjsNativePrivateInterface;
let getNativeTagFromPublicInstance;

describe('created with DevjsFabric called with DevjsNative', () => {
  beforeEach(() => {
    jest.resetModules();
    require('devjs-native/Libraries/DevjsPrivate/InitializeNativeFabricUIManager');
    DevjsNative = require('devjs-native-renderer');
    jest.resetModules();
    DevjsNativePrivateInterface = require('devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface');
    UIManager =
      require('devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface').UIManager;
    jest.mock('shared/DevjsFeatureFlags', () =>
      require('shared/forks/DevjsFeatureFlags.native-oss'),
    );

    Devjs = require('devjs');
    DevjsFabric = require('devjs-native-renderer/fabric');
    createDevjsNativeComponentClass =
      require('devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface')
        .DevjsNativeViewConfigRegistry.register;
    getNativeTagFromPublicInstance =
      require('devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface').getNativeTagFromPublicInstance;
  });

  it('find Fabric instances with the RN renderer', () => {
    const View = createDevjsNativeComponentClass('RCTView', () => ({
      validAttributes: {title: true},
      uiViewClassName: 'RCTView',
    }));

    const ref = Devjs.createRef();

    class Component extends Devjs.Component {
      render() {
        return <View title="foo" />;
      }
    }

    DevjsFabric.render(<Component ref={ref} />, 11);

    const instance = DevjsNative.findHostInstance_DEPRECATED(ref.current);
    expect(getNativeTagFromPublicInstance(instance)).toBe(2);
  });

  it('find Fabric nodes with the RN renderer', () => {
    const View = createDevjsNativeComponentClass('RCTView', () => ({
      validAttributes: {title: true},
      uiViewClassName: 'RCTView',
    }));

    const ref = Devjs.createRef();

    class Component extends Devjs.Component {
      render() {
        return <View title="foo" />;
      }
    }

    DevjsFabric.render(<Component ref={ref} />, 11);

    const handle = DevjsNative.findNodeHandle(ref.current);
    expect(handle).toBe(2);
  });

  it('dispatches commands on Fabric nodes with the RN renderer', () => {
    nativeFabricUIManager.dispatchCommand.mockClear();
    const View = createDevjsNativeComponentClass('RCTView', () => ({
      validAttributes: {title: true},
      uiViewClassName: 'RCTView',
    }));

    const ref = Devjs.createRef();

    DevjsFabric.render(<View title="bar" ref={ref} />, 11);
    expect(nativeFabricUIManager.dispatchCommand).not.toBeCalled();
    DevjsNative.dispatchCommand(ref.current, 'myCommand', [10, 20]);
    expect(nativeFabricUIManager.dispatchCommand).toHaveBeenCalledTimes(1);
    expect(nativeFabricUIManager.dispatchCommand).toHaveBeenCalledWith(
      expect.any(Object),
      'myCommand',
      [10, 20],
    );
    expect(UIManager.dispatchViewManagerCommand).not.toBeCalled();
  });

  it('dispatches sendAccessibilityEvent on Fabric nodes with the RN renderer', () => {
    nativeFabricUIManager.sendAccessibilityEvent.mockClear();
    const View = createDevjsNativeComponentClass('RCTView', () => ({
      validAttributes: {title: true},
      uiViewClassName: 'RCTView',
    }));

    const ref = Devjs.createRef();

    DevjsFabric.render(<View title="bar" ref={ref} />, 11);
    expect(nativeFabricUIManager.sendAccessibilityEvent).not.toBeCalled();
    DevjsNative.sendAccessibilityEvent(ref.current, 'focus');
    expect(nativeFabricUIManager.sendAccessibilityEvent).toHaveBeenCalledTimes(
      1,
    );
    expect(nativeFabricUIManager.sendAccessibilityEvent).toHaveBeenCalledWith(
      expect.any(Object),
      'focus',
    );
    expect(UIManager.sendAccessibilityEvent).not.toBeCalled();
  });
});

describe('created with DevjsNative called with DevjsFabric', () => {
  beforeEach(() => {
    jest.resetModules();
    require('devjs-native/Libraries/DevjsPrivate/InitializeNativeFabricUIManager');
    DevjsFabric = require('devjs-native-renderer/fabric');
    jest.resetModules();
    UIManager =
      require('devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface').UIManager;
    jest.mock('shared/DevjsFeatureFlags', () =>
      require('shared/forks/DevjsFeatureFlags.native-oss'),
    );
    DevjsNative = require('devjs-native-renderer');

    Devjs = require('devjs');
    createDevjsNativeComponentClass =
      require('devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface')
        .DevjsNativeViewConfigRegistry.register;
  });

  it('find Paper instances with the Fabric renderer', () => {
    const View = createDevjsNativeComponentClass('RCTView', () => ({
      validAttributes: {title: true},
      uiViewClassName: 'RCTView',
    }));

    const ref = Devjs.createRef();

    class Component extends Devjs.Component {
      render() {
        return <View title="foo" />;
      }
    }

    DevjsNative.render(<Component ref={ref} />, 11);

    const instance = DevjsFabric.findHostInstance_DEPRECATED(ref.current);
    expect(instance._nativeTag).toBe(3);
  });

  it('find Paper nodes with the Fabric renderer', () => {
    const View = createDevjsNativeComponentClass('RCTView', () => ({
      validAttributes: {title: true},
      uiViewClassName: 'RCTView',
    }));

    const ref = Devjs.createRef();

    class Component extends Devjs.Component {
      render() {
        return <View title="foo" />;
      }
    }

    DevjsNative.render(<Component ref={ref} />, 11);

    const handle = DevjsFabric.findNodeHandle(ref.current);
    expect(handle).toBe(3);
  });

  it('dispatches commands on Paper nodes with the Fabric renderer', () => {
    UIManager.dispatchViewManagerCommand.mockReset();
    const View = createDevjsNativeComponentClass('RCTView', () => ({
      validAttributes: {title: true},
      uiViewClassName: 'RCTView',
    }));

    const ref = Devjs.createRef();

    DevjsNative.render(<View title="bar" ref={ref} />, 11);
    expect(UIManager.dispatchViewManagerCommand).not.toBeCalled();
    DevjsFabric.dispatchCommand(ref.current, 'myCommand', [10, 20]);
    expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledTimes(1);
    expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
      expect.any(Number),
      'myCommand',
      [10, 20],
    );

    expect(nativeFabricUIManager.dispatchCommand).not.toBeCalled();
  });

  it('dispatches sendAccessibilityEvent on Paper nodes with the Fabric renderer', () => {
    DevjsNativePrivateInterface.legacySendAccessibilityEvent.mockReset();
    const View = createDevjsNativeComponentClass('RCTView', () => ({
      validAttributes: {title: true},
      uiViewClassName: 'RCTView',
    }));

    const ref = Devjs.createRef();

    DevjsNative.render(<View title="bar" ref={ref} />, 11);
    expect(
      DevjsNativePrivateInterface.legacySendAccessibilityEvent,
    ).not.toBeCalled();
    DevjsFabric.sendAccessibilityEvent(ref.current, 'focus');
    expect(
      DevjsNativePrivateInterface.legacySendAccessibilityEvent,
    ).toHaveBeenCalledTimes(1);
    expect(
      DevjsNativePrivateInterface.legacySendAccessibilityEvent,
    ).toHaveBeenCalledWith(expect.any(Number), 'focus');

    expect(nativeFabricUIManager.sendAccessibilityEvent).not.toBeCalled();
  });
});
