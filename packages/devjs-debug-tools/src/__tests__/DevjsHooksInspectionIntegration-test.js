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
let DevjsTestRenderer;
let DevjsDebugTools;
let act;
let useMemoCache;

function normalizeSourceLoc(tree) {
  tree.forEach(node => {
    if (node.hookSource) {
      node.hookSource.fileName = '**';
      node.hookSource.lineNumber = 0;
      node.hookSource.columnNumber = 0;
    }
    normalizeSourceLoc(node.subHooks);
  });
  return tree;
}

describe('DevjsHooksInspectionIntegration', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsTestRenderer = require('devjs-test-renderer');
    ({act} = require('internal-test-utils'));
    DevjsDebugTools = require('devjs-debug-tools');
    useMemoCache = require('devjs/compiler-runtime').c;
  });

  it('should inspect the current state of useState hooks', async () => {
    const useState = Devjs.useState;
    function Foo(props) {
      const [state1, setState1] = useState('hello');
      const [state2, setState2] = useState('world');
      return (
        <div onMouseDown={setState1} onMouseUp={setState2}>
          {state1} {state2}
        </div>
      );
    }
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo prop="prop" />, {
        unstable_isConcurrent: true,
      });
    });

    let childFiber = renderer.root.findByType(Foo)._currentFiber();
    let tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "hello",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "world",
        },
      ]
    `);

    const {onMouseDown: setStateA, onMouseUp: setStateB} =
      renderer.root.findByType('div').props;

    await act(() => setStateA('Hi'));

    childFiber = renderer.root.findByType(Foo)._currentFiber();
    tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);

    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "Hi",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "world",
        },
      ]
    `);

    await act(() => setStateB('world!'));

    childFiber = renderer.root.findByType(Foo)._currentFiber();
    tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);

    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "Hi",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "world!",
        },
      ]
    `);
  });

  it('should inspect the current state of all stateful hooks', async () => {
    const outsideRef = Devjs.createRef();
    function effect() {}
    function Foo(props) {
      const [state1, setState] = Devjs.useState('a');
      const [state2, dispatch] = Devjs.useReducer((s, a) => a.value, 'b');
      const ref = Devjs.useRef('c');

      Devjs.useLayoutEffect(effect);
      Devjs.useEffect(effect);

      Devjs.useImperativeHandle(outsideRef, () => {
        // Return a function so that jest treats them as non-equal.
        return function Instance() {};
      }, []);

      Devjs.useMemo(() => state1 + state2, [state1]);

      function update() {
        setState('A');
        dispatch({value: 'B'});
        ref.current = 'C';
      }
      const memoizedUpdate = Devjs.useCallback(update, []);
      return (
        <div onClick={memoizedUpdate}>
          {state1} {state2}
        </div>
      );
    }
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo prop="prop" />, {
        unstable_isConcurrent: true,
      });
    });

    let childFiber = renderer.root.findByType(Foo)._currentFiber();

    const {onClick: updateStates} = renderer.root.findByType('div').props;

    let tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "a",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": true,
          "name": "Reducer",
          "subHooks": [],
          "value": "b",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Ref",
          "subHooks": [],
          "value": "c",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 3,
          "isStateEditable": false,
          "name": "LayoutEffect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 4,
          "isStateEditable": false,
          "name": "Effect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 5,
          "isStateEditable": false,
          "name": "ImperativeHandle",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 6,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "ab",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 7,
          "isStateEditable": false,
          "name": "Callback",
          "subHooks": [],
          "value": [Function],
        },
      ]
    `);

    await act(() => {
      updateStates();
    });

    childFiber = renderer.root.findByType(Foo)._currentFiber();
    tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);

    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "A",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": true,
          "name": "Reducer",
          "subHooks": [],
          "value": "B",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Ref",
          "subHooks": [],
          "value": "C",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 3,
          "isStateEditable": false,
          "name": "LayoutEffect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 4,
          "isStateEditable": false,
          "name": "Effect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 5,
          "isStateEditable": false,
          "name": "ImperativeHandle",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 6,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "AB",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 7,
          "isStateEditable": false,
          "name": "Callback",
          "subHooks": [],
          "value": [Function],
        },
      ]
    `);
  });

  it('should inspect the current state of all stateful hooks, including useInsertionEffect', async () => {
    const useInsertionEffect = Devjs.useInsertionEffect;
    const outsideRef = Devjs.createRef();
    function effect() {}
    function Foo(props) {
      const [state1, setState] = Devjs.useState('a');
      const [state2, dispatch] = Devjs.useReducer((s, a) => a.value, 'b');
      const ref = Devjs.useRef('c');

      useInsertionEffect(effect);
      Devjs.useLayoutEffect(effect);
      Devjs.useEffect(effect);

      Devjs.useImperativeHandle(outsideRef, () => {
        // Return a function so that jest treats them as non-equal.
        return function Instance() {};
      }, []);

      Devjs.useMemo(() => state1 + state2, [state1]);

      async function update() {
        setState('A');
        dispatch({value: 'B'});
        ref.current = 'C';
      }
      const memoizedUpdate = Devjs.useCallback(update, []);
      return (
        <div onClick={memoizedUpdate}>
          {state1} {state2}
        </div>
      );
    }
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo prop="prop" />, {
        unstable_isConcurrent: true,
      });
    });

    let childFiber = renderer.root.findByType(Foo)._currentFiber();

    const {onClick: updateStates} = renderer.root.findByType('div').props;

    let tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "a",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": true,
          "name": "Reducer",
          "subHooks": [],
          "value": "b",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Ref",
          "subHooks": [],
          "value": "c",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 3,
          "isStateEditable": false,
          "name": "InsertionEffect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 4,
          "isStateEditable": false,
          "name": "LayoutEffect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 5,
          "isStateEditable": false,
          "name": "Effect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 6,
          "isStateEditable": false,
          "name": "ImperativeHandle",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 7,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "ab",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 8,
          "isStateEditable": false,
          "name": "Callback",
          "subHooks": [],
          "value": [Function],
        },
      ]
    `);

    await act(() => {
      updateStates();
    });

    childFiber = renderer.root.findByType(Foo)._currentFiber();
    tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);

    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "A",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": true,
          "name": "Reducer",
          "subHooks": [],
          "value": "B",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Ref",
          "subHooks": [],
          "value": "C",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 3,
          "isStateEditable": false,
          "name": "InsertionEffect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 4,
          "isStateEditable": false,
          "name": "LayoutEffect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 5,
          "isStateEditable": false,
          "name": "Effect",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 6,
          "isStateEditable": false,
          "name": "ImperativeHandle",
          "subHooks": [],
          "value": [Function],
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 7,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "AB",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 8,
          "isStateEditable": false,
          "name": "Callback",
          "subHooks": [],
          "value": [Function],
        },
      ]
    `);
  });

  it('should inspect the value of the current provider in useContext', async () => {
    const MyContext = Devjs.createContext('default');
    const ThemeContext = Devjs.createContext('default');
    ThemeContext.displayName = 'Theme';
    function Foo(props) {
      const value = Devjs.useContext(MyContext);
      Devjs.useContext(ThemeContext);
      return <div>{value}</div>;
    }
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(
        <MyContext.Provider value="contextual">
          <Foo prop="prop" />
        </MyContext.Provider>,
        {unstable_isConcurrent: true},
      );
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": null,
          "isStateEditable": false,
          "name": "Context",
          "subHooks": [],
          "value": "contextual",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": null,
          "isStateEditable": false,
          "name": "Theme",
          "subHooks": [],
          "value": "default",
        },
      ]
    `);
  });

  // @devjsVersion >= 16.8
  it('should inspect the value of the current provider in useContext reading the same context multiple times', async () => {
    const ContextA = Devjs.createContext('default A');
    const ContextB = Devjs.createContext('default B');
    function Foo(props) {
      Devjs.useContext(ContextA);
      Devjs.useContext(ContextA);
      Devjs.useContext(ContextB);
      Devjs.useContext(ContextB);
      Devjs.useContext(ContextA);
      Devjs.useContext(ContextB);
      Devjs.useContext(ContextB);
      Devjs.useContext(ContextB);
      return null;
    }
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(
        <ContextA.Provider value="contextual A">
          <Foo prop="prop" />
        </ContextA.Provider>,
        {unstable_isConcurrent: true},
      );
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);

    expect(normalizeSourceLoc(tree)).toEqual([
      expect.objectContaining({value: 'contextual A'}),
      expect.objectContaining({value: 'contextual A'}),
      expect.objectContaining({value: 'default B'}),
      expect.objectContaining({value: 'default B'}),
      expect.objectContaining({value: 'contextual A'}),
      expect.objectContaining({value: 'default B'}),
      expect.objectContaining({value: 'default B'}),
      expect.objectContaining({value: 'default B'}),
    ]);
  });

  it('should inspect forwardRef', async () => {
    const obj = function () {};
    const Foo = Devjs.forwardRef(function (props, ref) {
      Devjs.useImperativeHandle(ref, () => obj);
      return <div />;
    });
    const ref = Devjs.createRef();
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo ref={ref} />, {
        unstable_isConcurrent: true,
      });
    });

    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": null,
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": false,
          "name": "ImperativeHandle",
          "subHooks": [],
          "value": [Function],
        },
      ]
    `);
  });

  it('should inspect memo', async () => {
    function InnerFoo(props) {
      const [value] = Devjs.useState('hello');
      return <div>{value}</div>;
    }
    const Foo = Devjs.memo(InnerFoo);
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    // TODO: Test renderer findByType is broken for memo. Have to search for the inner.
    const childFiber = renderer.root.findByType(InnerFoo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "InnerFoo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": "hello",
        },
      ]
    `);
  });

  it('should inspect custom hooks', async () => {
    function useCustom() {
      const [value] = Devjs.useState('hello');
      return value;
    }
    function Foo(props) {
      const value = useCustom();
      return <div>{value}</div>;
    }
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": null,
          "isStateEditable": false,
          "name": "Custom",
          "subHooks": [
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "useCustom",
                "lineNumber": 0,
              },
              "id": 0,
              "isStateEditable": true,
              "name": "State",
              "subHooks": [],
              "value": "hello",
            },
          ],
          "value": undefined,
        },
      ]
    `);
  });

  it('should support composite useTransition hook', async () => {
    function Foo(props) {
      Devjs.useTransition();
      const memoizedValue = Devjs.useMemo(() => 'hello', []);
      Devjs.useMemo(() => 'not used', []);
      return <div>{memoizedValue}</div>;
    }
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": false,
          "name": "Transition",
          "subHooks": [],
          "value": false,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "hello",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);
  });

  it('should update isPending returned from useTransition', async () => {
    const IndefiniteSuspender = Devjs.lazy(() => new Promise(() => {}));
    let startTransition;
    function Foo(props) {
      const [show, setShow] = Devjs.useState(false);
      const [isPending, _startTransition] = Devjs.useTransition();
      Devjs.useMemo(() => 'hello', []);
      Devjs.useMemo(() => 'not used', []);

      // Otherwise we capture the version from the devjs-debug-tools dispatcher.
      if (startTransition === undefined) {
        startTransition = () => {
          _startTransition(() => {
            setShow(true);
          });
        };
      }

      return (
        <Devjs.Suspense fallback="Loading">
          {isPending ? 'Pending' : null}
          {show ? <IndefiniteSuspender /> : null}
        </Devjs.Suspense>
      );
    }
    const renderer = await act(() => {
      return DevjsTestRenderer.create(<Foo />, {unstable_isConcurrent: true});
    });
    expect(renderer).toMatchRenderedOutput(null);
    let childFiber = renderer.root.findByType(Foo)._currentFiber();
    let tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": false,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "Transition",
          "subHooks": [],
          "value": false,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "hello",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 3,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);

    await act(() => {
      startTransition();
    });

    expect(renderer).toMatchRenderedOutput('Pending');

    childFiber = renderer.root.findByType(Foo)._currentFiber();
    tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": false,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "Transition",
          "subHooks": [],
          "value": true,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "hello",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 3,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);
  });

  it('should support useDeferredValue hook', async () => {
    function Foo(props) {
      Devjs.useDeferredValue('abc');
      const memoizedValue = Devjs.useMemo(() => 1, []);
      Devjs.useMemo(() => 2, []);
      return <div>{memoizedValue}</div>;
    }
    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": false,
          "name": "DeferredValue",
          "subHooks": [],
          "value": "abc",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": 1,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": 2,
        },
      ]
    `);
  });

  it('should return the deferred value', async () => {
    let unsuspend;
    function Lazy() {
      return 'Lazy';
    }
    const Suspender = Devjs.lazy(
      () =>
        new Promise(resolve => {
          unsuspend = () => resolve({default: Lazy});
        }),
    );
    const Context = Devjs.createContext('default');
    let setShow;
    function Foo(props) {
      const [show, _setShow] = Devjs.useState(false);
      const deferredShow = Devjs.useDeferredValue(show);
      const isPending = show !== deferredShow;
      const contextDisplay = isPending ? Devjs.use(Context) : '<none>';
      Devjs.useMemo(() => 'hello', []);
      Devjs.useMemo(() => 'not used', []);

      // Otherwise we capture the version from the devjs-debug-tools dispatcher.
      if (setShow === undefined) {
        setShow = _setShow;
      }

      return (
        <Devjs.Suspense fallback="Loading">
          Context: {contextDisplay}, {isPending ? 'Pending' : 'Nothing Pending'}
          {deferredShow ? [', ', <Suspender key="suspender" />] : null}
        </Devjs.Suspense>
      );
    }
    const renderer = await act(() => {
      return DevjsTestRenderer.create(
        <Context.Provider value="provided">
          <Foo />
        </Context.Provider>,
        {unstable_isConcurrent: true},
      );
    });
    let childFiber = renderer.root.findByType(Foo)._currentFiber();
    let tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(renderer).toMatchRenderedOutput('Context: <none>, Nothing Pending');
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": false,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "DeferredValue",
          "subHooks": [],
          "value": false,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "hello",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 3,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);

    await act(() => {
      setShow(true);
    });

    expect(renderer).toMatchRenderedOutput('Context: provided, Pending');
    childFiber = renderer.root.findByType(Foo)._currentFiber();
    tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": true,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "DeferredValue",
          "subHooks": [],
          "value": false,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": null,
          "isStateEditable": false,
          "name": "Context",
          "subHooks": [],
          "value": "provided",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "hello",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 3,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);

    await act(() => {
      unsuspend();
    });

    expect(renderer).toMatchRenderedOutput(
      'Context: <none>, Nothing Pending, Lazy',
    );
    childFiber = renderer.root.findByType(Foo)._currentFiber();
    tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": true,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "DeferredValue",
          "subHooks": [],
          "value": true,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "hello",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 3,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);
  });

  it('should support useId hook', async () => {
    function Foo(props) {
      const id = Devjs.useId();
      const [state] = Devjs.useState('hello');
      return <div id={id}>{state}</div>;
    }

    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);

    expect(tree.length).toEqual(2);

    expect(tree[0].id).toEqual(0);
    expect(tree[0].isStateEditable).toEqual(false);
    expect(tree[0].name).toEqual('Id');
    expect(String(tree[0].value).startsWith('_r_')).toBe(true);

    expect(normalizeSourceLoc(tree)[1]).toMatchInlineSnapshot(`
      {
        "debugInfo": null,
        "hookSource": {
          "columnNumber": 0,
          "fileName": "**",
          "functionName": "Foo",
          "lineNumber": 0,
        },
        "id": 1,
        "isStateEditable": true,
        "name": "State",
        "subHooks": [],
        "value": "hello",
      }
    `);
  });

  describe('useMemoCache', () => {
    it('should not be inspectable', async () => {
      function Foo() {
        const $ = useMemoCache(1);
        let t0;

        if ($[0] === Symbol.for('devjs.memo_cache_sentinel')) {
          t0 = <div>{1}</div>;
          $[0] = t0;
        } else {
          t0 = $[0];
        }

        return t0;
      }

      let renderer;
      await act(() => {
        renderer = DevjsTestRenderer.create(<Foo />, {
          unstable_isConcurrent: true,
        });
      });
      const childFiber = renderer.root.findByType(Foo)._currentFiber();
      const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);

      expect(tree.length).toEqual(0);
    });

    it('should work in combination with other hooks', async () => {
      function useSomething() {
        const [something] = Devjs.useState(null);
        const changeOtherSomething = Devjs.useCallback(() => {}, [something]);

        return [something, changeOtherSomething];
      }

      function Foo() {
        const $ = useMemoCache(10);

        useSomething();
        Devjs.useState(1);
        Devjs.useEffect(() => {});

        let t0;

        if ($[0] === Symbol.for('devjs.memo_cache_sentinel')) {
          t0 = <div>{1}</div>;
          $[0] = t0;
        } else {
          t0 = $[0];
        }

        return t0;
      }

      let renderer;
      await act(() => {
        renderer = DevjsTestRenderer.create(<Foo />, {
          unstable_isConcurrent: true,
        });
      });
      const childFiber = renderer.root.findByType(Foo)._currentFiber();
      const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);

      expect(tree.length).toEqual(3);
    });
  });

  describe('useDebugValue', () => {
    it('should support inspectable values for multiple custom hooks', async () => {
      function useLabeledValue(label) {
        const [value] = Devjs.useState(label);
        Devjs.useDebugValue(`custom label ${label}`);
        return value;
      }
      function useAnonymous(label) {
        const [value] = Devjs.useState(label);
        return value;
      }
      function Example() {
        useLabeledValue('a');
        Devjs.useState('b');
        useAnonymous('c');
        useLabeledValue('d');
        return null;
      }
      let renderer;
      await act(() => {
        renderer = DevjsTestRenderer.create(<Example />, {
          unstable_isConcurrent: true,
        });
      });
      const childFiber = renderer.root.findByType(Example)._currentFiber();
      const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
      if (__DEV__) {
        expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
          [
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "LabeledValue",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useLabeledValue",
                    "lineNumber": 0,
                  },
                  "id": 0,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": "a",
                },
              ],
              "value": "custom label a",
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": 1,
              "isStateEditable": true,
              "name": "State",
              "subHooks": [],
              "value": "b",
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "Anonymous",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useAnonymous",
                    "lineNumber": 0,
                  },
                  "id": 2,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": "c",
                },
              ],
              "value": undefined,
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "LabeledValue",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useLabeledValue",
                    "lineNumber": 0,
                  },
                  "id": 3,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": "d",
                },
              ],
              "value": "custom label d",
            },
          ]
        `);
      } else
        expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
          [
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "LabeledValue",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useLabeledValue",
                    "lineNumber": 0,
                  },
                  "id": 0,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": "a",
                },
              ],
              "value": undefined,
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": 1,
              "isStateEditable": true,
              "name": "State",
              "subHooks": [],
              "value": "b",
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "Anonymous",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useAnonymous",
                    "lineNumber": 0,
                  },
                  "id": 2,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": "c",
                },
              ],
              "value": undefined,
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "LabeledValue",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useLabeledValue",
                    "lineNumber": 0,
                  },
                  "id": 3,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": "d",
                },
              ],
              "value": undefined,
            },
          ]
        `);
    });

    it('should support inspectable values for nested custom hooks', async () => {
      function useInner() {
        Devjs.useDebugValue('inner');
        Devjs.useState(0);
      }
      function useOuter() {
        Devjs.useDebugValue('outer');
        useInner();
      }
      function Example() {
        useOuter();
        return null;
      }
      let renderer;
      await act(() => {
        renderer = DevjsTestRenderer.create(<Example />, {
          unstable_isConcurrent: true,
        });
      });
      const childFiber = renderer.root.findByType(Example)._currentFiber();
      const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
      if (__DEV__) {
        expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
          [
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "Outer",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useOuter",
                    "lineNumber": 0,
                  },
                  "id": null,
                  "isStateEditable": false,
                  "name": "Inner",
                  "subHooks": [
                    {
                      "debugInfo": null,
                      "hookSource": {
                        "columnNumber": 0,
                        "fileName": "**",
                        "functionName": "useInner",
                        "lineNumber": 0,
                      },
                      "id": 0,
                      "isStateEditable": true,
                      "name": "State",
                      "subHooks": [],
                      "value": 0,
                    },
                  ],
                  "value": "inner",
                },
              ],
              "value": "outer",
            },
          ]
        `);
      } else
        expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
          [
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "Outer",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useOuter",
                    "lineNumber": 0,
                  },
                  "id": null,
                  "isStateEditable": false,
                  "name": "Inner",
                  "subHooks": [
                    {
                      "debugInfo": null,
                      "hookSource": {
                        "columnNumber": 0,
                        "fileName": "**",
                        "functionName": "useInner",
                        "lineNumber": 0,
                      },
                      "id": 0,
                      "isStateEditable": true,
                      "name": "State",
                      "subHooks": [],
                      "value": 0,
                    },
                  ],
                  "value": undefined,
                },
              ],
              "value": undefined,
            },
          ]
        `);
    });

    it('should support multiple inspectable values per custom hooks', async () => {
      function useMultiLabelCustom() {
        Devjs.useDebugValue('one');
        Devjs.useDebugValue('two');
        Devjs.useDebugValue('three');
        Devjs.useState(0);
      }
      function useSingleLabelCustom(value) {
        Devjs.useDebugValue(`single ${value}`);
        Devjs.useState(0);
      }
      function Example() {
        useSingleLabelCustom('one');
        useMultiLabelCustom();
        useSingleLabelCustom('two');
        return null;
      }
      let renderer;
      await act(() => {
        renderer = DevjsTestRenderer.create(<Example />, {
          unstable_isConcurrent: true,
        });
      });
      const childFiber = renderer.root.findByType(Example)._currentFiber();
      const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
      if (__DEV__) {
        expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
          [
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "SingleLabelCustom",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useSingleLabelCustom",
                    "lineNumber": 0,
                  },
                  "id": 0,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": 0,
                },
              ],
              "value": "single one",
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "MultiLabelCustom",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useMultiLabelCustom",
                    "lineNumber": 0,
                  },
                  "id": 1,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": 0,
                },
              ],
              "value": [
                "one",
                "two",
                "three",
              ],
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "SingleLabelCustom",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useSingleLabelCustom",
                    "lineNumber": 0,
                  },
                  "id": 2,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": 0,
                },
              ],
              "value": "single two",
            },
          ]
        `);
      } else
        expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
          [
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "SingleLabelCustom",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useSingleLabelCustom",
                    "lineNumber": 0,
                  },
                  "id": 0,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": 0,
                },
              ],
              "value": undefined,
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "MultiLabelCustom",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useMultiLabelCustom",
                    "lineNumber": 0,
                  },
                  "id": 1,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": 0,
                },
              ],
              "value": undefined,
            },
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "SingleLabelCustom",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useSingleLabelCustom",
                    "lineNumber": 0,
                  },
                  "id": 2,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": 0,
                },
              ],
              "value": undefined,
            },
          ]
        `);
    });

    it('should ignore useDebugValue() made outside of a custom hook', async () => {
      function Example() {
        Devjs.useDebugValue('this is invalid');
        return null;
      }
      let renderer;
      await act(() => {
        renderer = DevjsTestRenderer.create(<Example />, {
          unstable_isConcurrent: true,
        });
      });
      const childFiber = renderer.root.findByType(Example)._currentFiber();
      const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
      expect(tree).toHaveLength(0);
    });

    it('should support an optional formatter function param', async () => {
      function useCustom() {
        Devjs.useDebugValue({bar: 123}, object => `bar:${object.bar}`);
        Devjs.useState(0);
      }
      function Example() {
        useCustom();
        return null;
      }
      let renderer;
      await act(() => {
        renderer = DevjsTestRenderer.create(<Example />, {
          unstable_isConcurrent: true,
        });
      });
      const childFiber = renderer.root.findByType(Example)._currentFiber();
      const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
      if (__DEV__) {
        expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
          [
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "Custom",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useCustom",
                    "lineNumber": 0,
                  },
                  "id": 0,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": 0,
                },
              ],
              "value": "bar:123",
            },
          ]
        `);
      } else
        expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
          [
            {
              "debugInfo": null,
              "hookSource": {
                "columnNumber": 0,
                "fileName": "**",
                "functionName": "Example",
                "lineNumber": 0,
              },
              "id": null,
              "isStateEditable": false,
              "name": "Custom",
              "subHooks": [
                {
                  "debugInfo": null,
                  "hookSource": {
                    "columnNumber": 0,
                    "fileName": "**",
                    "functionName": "useCustom",
                    "lineNumber": 0,
                  },
                  "id": 0,
                  "isStateEditable": true,
                  "name": "State",
                  "subHooks": [],
                  "value": 0,
                },
              ],
              "value": undefined,
            },
          ]
        `);
    });
  });

  // This test case is based on an open source bug report:
  // https://github.com/Suryanshu-Nabheetincubator/redux-devjs-hook/issues/34#issuecomment-466693787
  it('should properly advance the current hook for useContext', async () => {
    const MyContext = Devjs.createContext(1);

    let incrementCount;

    function Foo(props) {
      const context = Devjs.useContext(MyContext);
      const [data, setData] = Devjs.useState({count: context});

      incrementCount = () => setData(({count}) => ({count: count + 1}));

      return <div>count: {data.count}</div>;
    }

    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    expect(renderer.toJSON()).toEqual({
      type: 'div',
      props: {},
      children: ['count: ', '1'],
    });

    await act(() => incrementCount());
    expect(renderer.toJSON()).toEqual({
      type: 'div',
      props: {},
      children: ['count: ', '2'],
    });

    const childFiber = renderer.root._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": null,
          "isStateEditable": false,
          "name": "Context",
          "subHooks": [],
          "value": 1,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": true,
          "name": "State",
          "subHooks": [],
          "value": {
            "count": 2,
          },
        },
      ]
    `);
  });

  it('should support composite useSyncExternalStore hook', async () => {
    const useSyncExternalStore = Devjs.useSyncExternalStore;
    function Foo() {
      const value = useSyncExternalStore(
        () => () => {},
        () => 'snapshot',
      );
      Devjs.useMemo(() => 'memo', []);
      Devjs.useMemo(() => 'not used', []);
      return value;
    }

    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": false,
          "name": "SyncExternalStore",
          "subHooks": [],
          "value": "snapshot",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "memo",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);
  });

  it('should support use(Context) hook', async () => {
    const Context = Devjs.createContext('default');
    function Foo() {
      const value = Devjs.use(Context);
      Devjs.useMemo(() => 'memo', []);
      Devjs.useMemo(() => 'not used', []);

      return value;
    }

    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": null,
          "isStateEditable": false,
          "name": "Context",
          "subHooks": [],
          "value": "default",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "memo",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);
  });

  it('should support useOptimistic hook', async () => {
    const useOptimistic = Devjs.useOptimistic;
    function Foo() {
      const [value] = useOptimistic('abc', currentState => currentState);
      Devjs.useMemo(() => 'memo', []);
      Devjs.useMemo(() => 'not used', []);
      return value;
    }

    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": false,
          "name": "Optimistic",
          "subHooks": [],
          "value": "abc",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "memo",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);
  });

  it('should support useActionState hook', async () => {
    function Foo() {
      const [value] = Devjs.useActionState(function increment(n) {
        return n;
      }, 0);
      Devjs.useMemo(() => 'memo', []);
      Devjs.useMemo(() => 'not used', []);

      return value;
    }

    let renderer;
    await act(() => {
      renderer = DevjsTestRenderer.create(<Foo />, {
        unstable_isConcurrent: true,
      });
    });
    const childFiber = renderer.root.findByType(Foo)._currentFiber();
    const tree = DevjsDebugTools.inspectHooksOfFiber(childFiber);
    expect(normalizeSourceLoc(tree)).toMatchInlineSnapshot(`
      [
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 0,
          "isStateEditable": false,
          "name": "ActionState",
          "subHooks": [],
          "value": 0,
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 1,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "memo",
        },
        {
          "debugInfo": null,
          "hookSource": {
            "columnNumber": 0,
            "fileName": "**",
            "functionName": "Foo",
            "lineNumber": 0,
          },
          "id": 2,
          "isStateEditable": false,
          "name": "Memo",
          "subHooks": [],
          "value": "not used",
        },
      ]
    `);
  });
});
