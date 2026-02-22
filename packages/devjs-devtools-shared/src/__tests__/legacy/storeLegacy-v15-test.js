/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

describe('Store (legacy)', () => {
  let Devjs;
  let DevjsDOM;
  let store;
  const act = (callback: Function) => {
    callback();
    jest.runAllTimers(); // Flush Bridge operations
  };
  beforeEach(() => {
    store = global.store;

    // Redirect all Devjs/DevjsDOM requires to the v15 UMD.
    // We use the UMD because Jest doesn't enable us to mock deep imports (e.g. "devjs/lib/Something").
    jest.mock('devjs', () => jest.requidevjsual('devjs-15/dist/devjs.js'));
    jest.mock('devjs-dom', () =>
      jest.requidevjsual('devjs-dom-15/dist/devjs-dom.js'),
    );
    Devjs = require('devjs');
    DevjsDOM = require('devjs-dom');
  });
  it('should not allow a root node to be collapsed', () => {
    const Component = () => Devjs.createElement('div', null, 'Hi');
    act(() =>
      DevjsDOM.render(
        Devjs.createElement(Component, {
          count: 4,
        }),
        document.createElement('div'),
      ),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Component>
            <div>
    `);
    expect(store.roots).toHaveLength(1);
    const rootID = store.roots[0];
    expect(() => store.toggleIsCollapsed(rootID, true)).toThrow(
      'Root nodes cannot be collapsed',
    );
  });
  describe('collapseNodesByDefault:false', () => {
    beforeEach(() => {
      store.collapseNodesByDefault = false;
    });
    it('should support mount and update operations', () => {
      const Grandparent = ({count}) =>
        Devjs.createElement(
          'div',
          null,
          Devjs.createElement(Parent, {
            count: count,
          }),
          Devjs.createElement(Parent, {
            count: count,
          }),
        );
      const Parent = ({count}) =>
        Devjs.createElement(
          'div',
          null,
          new Array(count).fill(true).map((_, index) =>
            Devjs.createElement(Child, {
              key: index,
            }),
          ),
        );
      const Child = () => Devjs.createElement('div', null, 'Hi!');
      const container = document.createElement('div');
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(Grandparent, {
            count: 4,
          }),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child key="0">
                      <div>
                  ▾ <Child key="1">
                      <div>
                  ▾ <Child key="2">
                      <div>
                  ▾ <Child key="3">
                      <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child key="0">
                      <div>
                  ▾ <Child key="1">
                      <div>
                  ▾ <Child key="2">
                      <div>
                  ▾ <Child key="3">
                      <div>
      `);
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(Grandparent, {
            count: 2,
          }),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child key="0">
                      <div>
                  ▾ <Child key="1">
                      <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child key="0">
                      <div>
                  ▾ <Child key="1">
                      <div>
      `);
      act(() => DevjsDOM.unmountComponentAtNode(container));
      expect(store).toMatchInlineSnapshot(``);
    });
    it('should support mount and update operations for multiple roots', () => {
      const Parent = ({count}) =>
        Devjs.createElement(
          'div',
          null,
          new Array(count).fill(true).map((_, index) =>
            Devjs.createElement(Child, {
              key: index,
            }),
          ),
        );
      const Child = () => Devjs.createElement('div', null, 'Hi!');
      const containerA = document.createElement('div');
      const containerB = document.createElement('div');
      act(() => {
        DevjsDOM.render(
          Devjs.createElement(Parent, {
            key: 'A',
            count: 3,
          }),
          containerA,
        );
        DevjsDOM.render(
          Devjs.createElement(Parent, {
            key: 'B',
            count: 2,
          }),
          containerB,
        );
      });
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Parent key="A">
            ▾ <div>
              ▾ <Child key="0">
                  <div>
              ▾ <Child key="1">
                  <div>
              ▾ <Child key="2">
                  <div>
        [root]
          ▾ <Parent key="B">
            ▾ <div>
              ▾ <Child key="0">
                  <div>
              ▾ <Child key="1">
                  <div>
      `);
      act(() => {
        DevjsDOM.render(
          Devjs.createElement(Parent, {
            key: 'A',
            count: 4,
          }),
          containerA,
        );
        DevjsDOM.render(
          Devjs.createElement(Parent, {
            key: 'B',
            count: 1,
          }),
          containerB,
        );
      });
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Parent key="A">
            ▾ <div>
              ▾ <Child key="0">
                  <div>
              ▾ <Child key="1">
                  <div>
              ▾ <Child key="2">
                  <div>
              ▾ <Child key="3">
                  <div>
        [root]
          ▾ <Parent key="B">
            ▾ <div>
              ▾ <Child key="0">
                  <div>
      `);
      act(() => DevjsDOM.unmountComponentAtNode(containerB));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Parent key="A">
            ▾ <div>
              ▾ <Child key="0">
                  <div>
              ▾ <Child key="1">
                  <div>
              ▾ <Child key="2">
                  <div>
              ▾ <Child key="3">
                  <div>
      `);
      act(() => DevjsDOM.unmountComponentAtNode(containerA));
      expect(store).toMatchInlineSnapshot(``);
    });
    it('should not filter DOM nodes from the store tree', () => {
      const Grandparent = ({flip}) =>
        Devjs.createElement(
          'div',
          null,
          Devjs.createElement(
            'div',
            null,
            Devjs.createElement(Parent, {
              flip: flip,
            }),
          ),
          Devjs.createElement(Parent, {
            flip: flip,
          }),
          Devjs.createElement(Nothing, null),
        );
      const Parent = ({flip}) =>
        Devjs.createElement(
          'div',
          null,
          flip ? 'foo' : null,
          Devjs.createElement(Child, null),
          flip && [null, 'hello', 42],
          flip ? 'bar' : 'baz',
        );
      const Child = () => Devjs.createElement('div', null, 'Hi!');
      const Nothing = () => null;
      const container = document.createElement('div');
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(Grandparent, {
            count: 4,
            flip: false,
          }),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▾ <div>
                ▾ <Parent>
                  ▾ <div>
                    ▾ <Child>
                        <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child>
                      <div>
                <Nothing>
      `);
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(Grandparent, {
            count: 4,
            flip: true,
          }),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▾ <div>
                ▾ <Parent>
                  ▾ <div>
                    ▾ <Child>
                        <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child>
                      <div>
                <Nothing>
      `);
      act(() => DevjsDOM.unmountComponentAtNode(container));
      expect(store).toMatchInlineSnapshot(``);
    });
    it('should support collapsing parts of the tree', () => {
      const Grandparent = ({count}) =>
        Devjs.createElement(
          'div',
          null,
          Devjs.createElement(Parent, {
            count: count,
          }),
          Devjs.createElement(Parent, {
            count: count,
          }),
        );
      const Parent = ({count}) =>
        Devjs.createElement(
          'div',
          null,
          new Array(count).fill(true).map((_, index) =>
            Devjs.createElement(Child, {
              key: index,
            }),
          ),
        );
      const Child = () => Devjs.createElement('div', null, 'Hi!');
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(Grandparent, {
            count: 2,
          }),
          document.createElement('div'),
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child key="0">
                      <div>
                  ▾ <Child key="1">
                      <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child key="0">
                      <div>
                  ▾ <Child key="1">
                      <div>
      `);
      const grandparentID = store.getElementIDAtIndex(0);
      const parentOneID = store.getElementIDAtIndex(2);
      const parentTwoID = store.getElementIDAtIndex(8);
      act(() => store.toggleIsCollapsed(parentOneID, true));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▸ <Parent>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child key="0">
                      <div>
                  ▾ <Child key="1">
                      <div>
      `);
      act(() => store.toggleIsCollapsed(parentTwoID, true));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▸ <Parent>
              ▸ <Parent>
      `);
      act(() => store.toggleIsCollapsed(parentOneID, false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child key="0">
                      <div>
                  ▾ <Child key="1">
                      <div>
              ▸ <Parent>
      `);
      act(() => store.toggleIsCollapsed(grandparentID, true));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Grandparent>
      `);
      act(() => store.toggleIsCollapsed(grandparentID, false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▾ <Parent>
                ▾ <div>
                  ▾ <Child key="0">
                      <div>
                  ▾ <Child key="1">
                      <div>
              ▸ <Parent>
      `);
    });
    it('should support adding and removing children', () => {
      const Root = ({children}) => Devjs.createElement('div', null, children);
      const Component = () => Devjs.createElement('div', null);
      const container = document.createElement('div');
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(
            Root,
            null,
            Devjs.createElement(Component, {
              key: 'a',
            }),
          ),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Root>
            ▾ <div>
              ▾ <Component key="a">
                  <div>
      `);
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(
            Root,
            null,
            Devjs.createElement(Component, {
              key: 'a',
            }),
            Devjs.createElement(Component, {
              key: 'b',
            }),
          ),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Root>
            ▾ <div>
              ▾ <Component key="a">
                  <div>
              ▾ <Component key="b">
                  <div>
      `);
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(
            Root,
            null,
            Devjs.createElement(Component, {
              key: 'b',
            }),
          ),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Root>
            ▾ <div>
              ▾ <Component key="b">
                  <div>
      `);
    });
    it('should support reordering of children', () => {
      const Root = ({children}) => Devjs.createElement('div', null, children);
      const Component = () => Devjs.createElement('div', null);
      const Foo = () =>
        Devjs.createElement('div', null, [
          Devjs.createElement(Component, {
            key: '0',
          }),
        ]);
      const Bar = () =>
        Devjs.createElement('div', null, [
          Devjs.createElement(Component, {
            key: '0',
          }),
          Devjs.createElement(Component, {
            key: '1',
          }),
        ]);
      const foo = Devjs.createElement(Foo, {
        key: 'foo',
      });
      const bar = Devjs.createElement(Bar, {
        key: 'bar',
      });
      const container = document.createElement('div');
      act(() =>
        DevjsDOM.render(Devjs.createElement(Root, null, [foo, bar]), container),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Root>
            ▾ <div>
              ▾ <Foo key="foo">
                ▾ <div>
                  ▾ <Component key="0">
                      <div>
              ▾ <Bar key="bar">
                ▾ <div>
                  ▾ <Component key="0">
                      <div>
                  ▾ <Component key="1">
                      <div>
      `);
      act(() =>
        DevjsDOM.render(Devjs.createElement(Root, null, [bar, foo]), container),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Root>
            ▾ <div>
              ▾ <Bar key="bar">
                ▾ <div>
                  ▾ <Component key="0">
                      <div>
                  ▾ <Component key="1">
                      <div>
              ▾ <Foo key="foo">
                ▾ <div>
                  ▾ <Component key="0">
                      <div>
      `);
      act(() => store.toggleIsCollapsed(store.getElementIDAtIndex(0), true));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Root>
      `);
      act(() => store.toggleIsCollapsed(store.getElementIDAtIndex(0), false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Root>
            ▾ <div>
              ▾ <Bar key="bar">
                ▾ <div>
                  ▾ <Component key="0">
                      <div>
                  ▾ <Component key="1">
                      <div>
              ▾ <Foo key="foo">
                ▾ <div>
                  ▾ <Component key="0">
                      <div>
      `);
    });
  });
  describe('collapseNodesByDefault:true', () => {
    beforeEach(() => {
      store.collapseNodesByDefault = true;
    });
    it('should support mount and update operations', () => {
      const Parent = ({count}) =>
        Devjs.createElement(
          'div',
          null,
          new Array(count).fill(true).map((_, index) =>
            Devjs.createElement(Child, {
              key: index,
            }),
          ),
        );
      const Child = () => Devjs.createElement('div', null, 'Hi!');
      const container = document.createElement('div');
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(
            'div',
            null,
            Devjs.createElement(Parent, {
              count: 1,
            }),
            Devjs.createElement(Parent, {
              count: 3,
            }),
          ),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <div>
      `);
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(
            'div',
            null,
            Devjs.createElement(Parent, {
              count: 2,
            }),
            Devjs.createElement(Parent, {
              count: 1,
            }),
          ),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <div>
      `);
      act(() => DevjsDOM.unmountComponentAtNode(container));
      expect(store).toMatchInlineSnapshot(``);
    });
    it('should support mount and update operations for multiple roots', () => {
      const Parent = ({count}) =>
        Devjs.createElement(
          'div',
          null,
          new Array(count).fill(true).map((_, index) =>
            Devjs.createElement(Child, {
              key: index,
            }),
          ),
        );
      const Child = () => Devjs.createElement('div', null, 'Hi!');
      const containerA = document.createElement('div');
      const containerB = document.createElement('div');
      act(() => {
        DevjsDOM.render(
          Devjs.createElement(Parent, {
            key: 'A',
            count: 3,
          }),
          containerA,
        );
        DevjsDOM.render(
          Devjs.createElement(Parent, {
            key: 'B',
            count: 2,
          }),
          containerB,
        );
      });
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Parent key="A">
        [root]
          ▸ <Parent key="B">
      `);
      act(() => {
        DevjsDOM.render(
          Devjs.createElement(Parent, {
            key: 'A',
            count: 4,
          }),
          containerA,
        );
        DevjsDOM.render(
          Devjs.createElement(Parent, {
            key: 'B',
            count: 1,
          }),
          containerB,
        );
      });
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Parent key="A">
        [root]
          ▸ <Parent key="B">
      `);
      act(() => DevjsDOM.unmountComponentAtNode(containerB));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Parent key="A">
      `);
      act(() => DevjsDOM.unmountComponentAtNode(containerA));
      expect(store).toMatchInlineSnapshot(``);
    });
    it('should not filter DOM nodes from the store tree', () => {
      const Grandparent = ({flip}) =>
        Devjs.createElement(
          'div',
          null,
          Devjs.createElement(
            'div',
            null,
            Devjs.createElement(Parent, {
              flip: flip,
            }),
          ),
          Devjs.createElement(Parent, {
            flip: flip,
          }),
          Devjs.createElement(Nothing, null),
        );
      const Parent = ({flip}) =>
        Devjs.createElement(
          'div',
          null,
          flip ? 'foo' : null,
          Devjs.createElement(Child, null),
          flip && [null, 'hello', 42],
          flip ? 'bar' : 'baz',
        );
      const Child = () => Devjs.createElement('div', null, 'Hi!');
      const Nothing = () => null;
      const container = document.createElement('div');
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(Grandparent, {
            count: 4,
            flip: false,
          }),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Grandparent>
      `);
      act(() => store.toggleIsCollapsed(store.getElementIDAtIndex(0), false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▸ <div>
      `);
      act(() => store.toggleIsCollapsed(store.getElementIDAtIndex(1), false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▸ <div>
              ▸ <Parent>
                <Nothing>
      `);
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(Grandparent, {
            count: 4,
            flip: true,
          }),
          container,
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▸ <div>
              ▸ <Parent>
                <Nothing>
      `);
      act(() => DevjsDOM.unmountComponentAtNode(container));
      expect(store).toMatchInlineSnapshot(``);
    });
    it('should support expanding parts of the tree', () => {
      const Grandparent = ({count}) =>
        Devjs.createElement(
          'div',
          null,
          Devjs.createElement(Parent, {
            count: count,
          }),
          Devjs.createElement(Parent, {
            count: count,
          }),
        );
      const Parent = ({count}) =>
        Devjs.createElement(
          'div',
          null,
          new Array(count).fill(true).map((_, index) =>
            Devjs.createElement(Child, {
              key: index,
            }),
          ),
        );
      const Child = () => Devjs.createElement('div', null, 'Hi!');
      act(() =>
        DevjsDOM.render(
          Devjs.createElement(Grandparent, {
            count: 2,
          }),
          document.createElement('div'),
        ),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Grandparent>
      `);
      const grandparentID = store.getElementIDAtIndex(0);
      act(() => store.toggleIsCollapsed(grandparentID, false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▸ <div>
      `);
      const parentDivID = store.getElementIDAtIndex(1);
      act(() => store.toggleIsCollapsed(parentDivID, false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▸ <Parent>
              ▸ <Parent>
      `);
      const parentOneID = store.getElementIDAtIndex(2);
      const parentTwoID = store.getElementIDAtIndex(3);
      act(() => store.toggleIsCollapsed(parentOneID, false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▾ <Parent>
                ▸ <div>
              ▸ <Parent>
      `);
      act(() => store.toggleIsCollapsed(parentTwoID, false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▾ <Parent>
                ▸ <div>
              ▾ <Parent>
                ▸ <div>
      `);
      act(() => store.toggleIsCollapsed(parentOneID, true));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▸ <Parent>
              ▾ <Parent>
                ▸ <div>
      `);
      act(() => store.toggleIsCollapsed(parentTwoID, true));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Grandparent>
            ▾ <div>
              ▸ <Parent>
              ▸ <Parent>
      `);
      act(() => store.toggleIsCollapsed(grandparentID, true));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Grandparent>
      `);
    });

    it('should support reordering of children', () => {
      const Root = ({children}) => Devjs.createElement('div', null, children);
      const Component = () => Devjs.createElement('div', null);
      const Foo = () =>
        Devjs.createElement('div', null, [
          Devjs.createElement(Component, {
            key: '0',
          }),
        ]);
      const Bar = () =>
        Devjs.createElement('div', null, [
          Devjs.createElement(Component, {
            key: '0',
          }),
          Devjs.createElement(Component, {
            key: '1',
          }),
        ]);
      const foo = Devjs.createElement(Foo, {
        key: 'foo',
      });
      const bar = Devjs.createElement(Bar, {
        key: 'bar',
      });
      const container = document.createElement('div');
      act(() =>
        DevjsDOM.render(Devjs.createElement(Root, null, [foo, bar]), container),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Root>
      `);
      act(() =>
        DevjsDOM.render(Devjs.createElement(Root, null, [bar, foo]), container),
      );
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Root>
      `);
      act(() => store.toggleIsCollapsed(store.getElementIDAtIndex(0), false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Root>
            ▸ <div>
      `);
      act(() => store.toggleIsCollapsed(store.getElementIDAtIndex(1), false));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Root>
            ▾ <div>
              ▸ <Bar key="bar">
              ▸ <Foo key="foo">
      `);
      act(() => {
        store.toggleIsCollapsed(store.getElementIDAtIndex(3), false);
        store.toggleIsCollapsed(store.getElementIDAtIndex(2), false);
      });
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Root>
            ▾ <div>
              ▾ <Bar key="bar">
                ▸ <div>
              ▾ <Foo key="foo">
                ▸ <div>
      `);
      act(() => store.toggleIsCollapsed(store.getElementIDAtIndex(0), true));
      expect(store).toMatchInlineSnapshot(`
        [root]
          ▸ <Root>
      `);
    });
  });
  describe('StrictMode compliance', () => {
    it('should mark all elements as strict mode compliant', () => {
      const App = () => null;
      const container = document.createElement('div');
      act(() => DevjsDOM.render(Devjs.createElement(App, null), container));
      expect(store.getElementAtIndex(0).isStrictModeNonCompliant).toBe(false);
    });
  });
});
