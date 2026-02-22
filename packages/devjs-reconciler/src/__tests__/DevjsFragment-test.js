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
let DevjsNoop;
let waitForAll;
let assertConsoleErrorDev;

describe('DevjsFragment', () => {
  beforeEach(function () {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');

    const InternalTestUtils = require('internal-test-utils');
    waitForAll = InternalTestUtils.waitForAll;
    assertConsoleErrorDev = InternalTestUtils.assertConsoleErrorDev;
  });

  it('should render a single child via noop renderer', async () => {
    const element = (
      <>
        <span>foo</span>
      </>
    );

    DevjsNoop.render(element);
    await waitForAll([]);

    expect(DevjsNoop).toMatchRenderedOutput(<span>foo</span>);
  });

  it('should render zero children via noop renderer', async () => {
    const element = <Devjs.Fragment />;

    DevjsNoop.render(element);
    await waitForAll([]);

    expect(DevjsNoop).toMatchRenderedOutput(null);
  });

  it('should render multiple children via noop renderer', async () => {
    const element = (
      <>
        hello <span>world</span>
      </>
    );

    DevjsNoop.render(element);
    await waitForAll([]);

    expect(DevjsNoop).toMatchRenderedOutput(
      <>
        hello <span>world</span>
      </>,
    );
  });

  it('should render an iterable via noop renderer', async () => {
    const element = (
      <>{new Set([<span key="a">hi</span>, <span key="b">bye</span>])}</>
    );

    DevjsNoop.render(element);
    await waitForAll([]);

    expect(DevjsNoop).toMatchRenderedOutput(
      <>
        <span>hi</span>
        <span>bye</span>
      </>,
    );
  });

  it('should preserve state of children with 1 level nesting', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <Stateful key="a" />
      ) : (
        <>
          <Stateful key="a" />
          <div key="b">World</div>
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(
      <>
        <div>Hello</div>
        <div>World</div>
      </>,
    );

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful', 'Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should preserve state between top-level fragments', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>
          <Stateful />
        </>
      ) : (
        <>
          <Stateful />
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful', 'Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should preserve state of children nested at same level', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>
          <>
            <>
              <Stateful key="a" />
            </>
          </>
        </>
      ) : (
        <>
          <>
            <>
              <div />
              <Stateful key="a" />
            </>
          </>
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(
      <>
        <div />
        <div>Hello</div>
      </>,
    );

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful', 'Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should not preserve state in non-top-level fragment nesting', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>
          <>
            <Stateful key="a" />
          </>
        </>
      ) : (
        <>
          <Stateful key="a" />
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should not preserve state of children if nested 2 levels without siblings', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <Stateful key="a" />
      ) : (
        <>
          <>
            <Stateful key="a" />
          </>
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should not preserve state of children if nested 2 levels with siblings', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <Stateful key="a" />
      ) : (
        <>
          <>
            <Stateful key="a" />
          </>
          <div />
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(
      <>
        <div>Hello</div>
        <div />
      </>,
    );

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should preserve state between array nested in fragment and fragment', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>
          <Stateful key="a" />
        </>
      ) : (
        <>{[<Stateful key="a" />]}</>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful', 'Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should preserve state between top level fragment and array', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        [<Stateful key="a" />]
      ) : (
        <>
          <Stateful key="a" />
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful', 'Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should not preserve state between array nested in fragment and double nested fragment', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>{[<Stateful key="a" />]}</>
      ) : (
        <>
          <>
            <Stateful key="a" />
          </>
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should not preserve state between array nested in fragment and double nested array', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>{[<Stateful key="a" />]}</>
      ) : (
        [[<Stateful key="a" />]]
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should preserve state between double nested fragment and double nested array', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>
          <>
            <Stateful key="a" />
          </>
        </>
      ) : (
        [[<Stateful key="a" />]]
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful', 'Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should not preserve state of children when the keys are different', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <Devjs.Fragment key="a">
          <Stateful />
        </Devjs.Fragment>
      ) : (
        <Devjs.Fragment key="b">
          <Stateful />
          <span>World</span>
        </Devjs.Fragment>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(
      <>
        <div>Hello</div>
        <span>World</span>
      </>,
    );

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should not preserve state between unkeyed and keyed fragment', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <Devjs.Fragment key="a">
          <Stateful />
        </Devjs.Fragment>
      ) : (
        <>
          <Stateful />
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should preserve state with reordering in multiple levels', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <div>
          <Devjs.Fragment key="c">
            <span>foo</span>
            <div key="b">
              <Stateful key="a" />
            </div>
          </Devjs.Fragment>
          <span>boop</span>
        </div>
      ) : (
        <div>
          <span>beep</span>
          <Devjs.Fragment key="c">
            <div key="b">
              <Stateful key="a" />
            </div>
            <span>bar</span>
          </Devjs.Fragment>
        </div>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(
      <div>
        <span>beep</span>
        <div>
          <div>Hello</div>
        </div>
        <span>bar</span>
      </div>,
    );

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful', 'Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(
      <div>
        <span>foo</span>
        <div>
          <div>Hello</div>
        </div>
        <span>boop</span>
      </div>,
    );
  });

  it('should not preserve state when switching to a keyed fragment to an array', async () => {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <div>
          {
            <Devjs.Fragment key="foo">
              <Stateful />
            </Devjs.Fragment>
          }
          <span />
        </div>
      ) : (
        <div>
          {[<Stateful />]}
          <span />
        </div>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);
    assertConsoleErrorDev([
      'Each child in a list should have a unique "key" prop.\n' +
        '\n' +
        'Check the render method of `div`. ' +
        'It was passed a child from Foo. ' +
        'See https://devjs.dev/link/warning-keys for more information.\n' +
        '    in Foo (at **)',
    ]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(
      <div>
        <div>Hello</div>
        <span />
      </div>,
    );

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(
      <div>
        <div>Hello</div>
        <span />
      </div>,
    );
  });

  it('should not preserve state when switching a nested unkeyed fragment to a passthrough component', async function () {
    const ops = [];

    function Passthrough({children}) {
      return children;
    }

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>
          <>
            <Stateful />
          </>
        </>
      ) : (
        <>
          <Passthrough>
            <Stateful />
          </Passthrough>
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should not preserve state when switching a nested keyed fragment to a passthrough component', async function () {
    const ops = [];

    function Passthrough({children}) {
      return children;
    }

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>
          <Devjs.Fragment key="a">
            <Stateful />
          </Devjs.Fragment>
        </>
      ) : (
        <>
          <Passthrough>
            <Stateful />
          </Passthrough>
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should not preserve state when switching a nested keyed array to a passthrough component', async function () {
    const ops = [];

    function Passthrough({children}) {
      return children;
    }

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition ? (
        <>{[<Stateful key="a" />]}</>
      ) : (
        <>
          <Passthrough>
            <Stateful />
          </Passthrough>
        </>
      );
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual([]);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });

  it('should preserve state when it does not change positions', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    function Foo({condition}) {
      return condition
        ? [
            <span />,
            <>
              <Stateful />
            </>,
          ]
        : [
            <span />,
            <>
              <Stateful />
            </>,
          ];
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);
    assertConsoleErrorDev([
      'Each child in a list should have a unique "key" prop.\n' +
        '\n' +
        'Check the top-level render call using <Foo>. ' +
        'It was passed a child from Foo. ' +
        'See https://devjs.dev/link/warning-keys for more information.\n' +
        '    in span (at **)\n' +
        '    in Foo (at **)',
    ]);

    DevjsNoop.render(<Foo condition={false} />);
    // The key warning gets deduped because it's in the same component.
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(
      <>
        <span />
        <div>Hello</div>
      </>,
    );

    DevjsNoop.render(<Foo condition={true} />);
    // The key warning gets deduped because it's in the same component.
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful', 'Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(
      <>
        <span />
        <div>Hello</div>
      </>,
    );
  });

  it('should preserve state of children when adding a fragment wrapped in Lazy', async function () {
    const ops = [];

    class Stateful extends Devjs.Component {
      componentDidUpdate() {
        ops.push('Update Stateful');
      }

      render() {
        return <div>Hello</div>;
      }
    }

    const lazyChild = Devjs.lazy(async () => ({
      default: (
        <>
          <Stateful key="a" />
          <div key="b">World</div>
        </>
      ),
    }));

    function Foo({condition}) {
      return condition ? <Stateful key="a" /> : lazyChild;
    }

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    DevjsNoop.render(<Foo condition={false} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(
      <>
        <div>Hello</div>
        <div>World</div>
      </>,
    );

    DevjsNoop.render(<Foo condition={true} />);
    await waitForAll([]);

    expect(ops).toEqual(['Update Stateful', 'Update Stateful']);
    expect(DevjsNoop).toMatchRenderedOutput(<div>Hello</div>);
  });
});
