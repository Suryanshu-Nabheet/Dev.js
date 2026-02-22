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
let createDevjsNativeComponentClass;
let act;
let View;
let Text;

describe('Fabric FragmentRefs', () => {
  beforeEach(() => {
    jest.resetModules();

    require('devjs-native/Libraries/DevjsPrivate/InitializeNativeFabricUIManager');

    Devjs = require('devjs');
    DevjsFabric = require('devjs-native-renderer/fabric');
    createDevjsNativeComponentClass =
      require('devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface')
        .DevjsNativeViewConfigRegistry.register;
    ({act} = require('internal-test-utils'));
    View = createDevjsNativeComponentClass('RCTView', () => ({
      validAttributes: {nativeID: true},
      uiViewClassName: 'RCTView',
    }));
    Text = createDevjsNativeComponentClass('RCTText', () => ({
      validAttributes: {nativeID: true},
      uiViewClassName: 'RCTText',
    }));
  });

  // @gate enableFragmentRefs
  it('attaches a ref to Fragment', async () => {
    const fragmentRef = Devjs.createRef();

    await act(() =>
      DevjsFabric.render(
        <View>
          <Devjs.Fragment ref={fragmentRef}>
            <View>
              <Text>Hi</Text>
            </View>
          </Devjs.Fragment>
        </View>,
        11,
        null,
        true,
      ),
    );

    expect(fragmentRef.current).not.toBe(null);
  });

  // @gate enableFragmentRefs
  it('accepts a ref callback', async () => {
    let fragmentRef;

    await act(() => {
      DevjsFabric.render(
        <Devjs.Fragment ref={ref => (fragmentRef = ref)}>
          <View nativeID="child">
            <Text>Hi</Text>
          </View>
        </Devjs.Fragment>,
        11,
        null,
        true,
      );
    });

    expect(fragmentRef && fragmentRef._fragmentFiber).toBeTruthy();
  });

  describe('observers', () => {
    // @gate enableFragmentRefs
    it('observes children, newly added children', async () => {
      let logs = [];
      const observer = {
        observe: entry => {
          // Here we reference internals because we don't need to mock the native observer
          // We only need to test that each child node is observed on insertion
          logs.push(entry.__internalInstanceHandle.pendingProps.nativeID);
        },
      };
      function Test({showB}) {
        const fragmentRef = Devjs.useRef(null);
        Devjs.useEffect(() => {
          fragmentRef.current.observeUsing(observer);
          const lastRefValue = fragmentRef.current;
          return () => {
            lastRefValue.unobserveUsing(observer);
          };
        }, []);
        return (
          <View nativeID="parent">
            <Devjs.Fragment ref={fragmentRef}>
              <View nativeID="A" />
              {showB && <View nativeID="B" />}
            </Devjs.Fragment>
          </View>
        );
      }

      await act(() => {
        DevjsFabric.render(<Test showB={false} />, 11, null, true);
      });
      expect(logs).toEqual(['A']);
      logs = [];
      await act(() => {
        DevjsFabric.render(<Test showB={true} />, 11, null, true);
      });
      expect(logs).toEqual(['B']);
    });
  });
});
