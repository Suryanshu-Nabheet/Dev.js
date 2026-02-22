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
let act;

describe('DevjsIncrementalUpdatesMinimalism', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');

    act = require('internal-test-utils').act;
  });

  it('should render a simple component', async () => {
    function Child() {
      return <div>Hello World</div>;
    }

    function Parent() {
      return <Child />;
    }

    DevjsNoop.startTrackingHostCounters();
    await act(() => DevjsNoop.render(<Parent />));
    expect(DevjsNoop.stopTrackingHostCounters()).toEqual({
      hostUpdateCounter: 0,
    });

    DevjsNoop.startTrackingHostCounters();
    await act(() => DevjsNoop.render(<Parent />));
    expect(DevjsNoop.stopTrackingHostCounters()).toEqual({
      hostUpdateCounter: 1,
    });
  });

  it('should not diff referentially equal host elements', async () => {
    function Leaf(props) {
      return (
        <span>
          hello
          <b />
          {props.name}
        </span>
      );
    }

    const constEl = (
      <div>
        <Leaf name="world" />
      </div>
    );

    function Child() {
      return constEl;
    }

    function Parent() {
      return <Child />;
    }

    DevjsNoop.startTrackingHostCounters();
    await act(() => DevjsNoop.render(<Parent />));
    expect(DevjsNoop.stopTrackingHostCounters()).toEqual({
      hostUpdateCounter: 0,
    });

    DevjsNoop.startTrackingHostCounters();
    await act(() => DevjsNoop.render(<Parent />));
    expect(DevjsNoop.stopTrackingHostCounters()).toEqual({
      hostUpdateCounter: 0,
    });
  });

  it('should not diff parents of setState targets', async () => {
    let childInst;

    function Leaf(props) {
      return (
        <span>
          hello
          <b />
          {props.name}
        </span>
      );
    }

    class Child extends Devjs.Component {
      state = {name: 'Batman'};
      render() {
        childInst = this;
        return (
          <div>
            <Leaf name={this.state.name} />
          </div>
        );
      }
    }

    function Parent() {
      return (
        <section>
          <div>
            <Leaf name="world" />
            <Child />
            <hr />
            <Leaf name="world" />
          </div>
        </section>
      );
    }

    DevjsNoop.startTrackingHostCounters();
    await act(() => DevjsNoop.render(<Parent />));
    expect(DevjsNoop.stopTrackingHostCounters()).toEqual({
      hostUpdateCounter: 0,
    });

    DevjsNoop.startTrackingHostCounters();
    await act(() => childInst.setState({name: 'Robin'}));
    expect(DevjsNoop.stopTrackingHostCounters()).toEqual({
      // Child > div
      // Child > Leaf > span
      // Child > Leaf > span > b
      // Child > Leaf > span > #text
      hostUpdateCounter: 4,
    });

    DevjsNoop.startTrackingHostCounters();
    await act(() => DevjsNoop.render(<Parent />));
    expect(DevjsNoop.stopTrackingHostCounters()).toEqual({
      // Parent > section
      // Parent > section > div
      // Parent > section > div > Leaf > span
      // Parent > section > div > Leaf > span > b
      // Parent > section > div > Child > div
      // Parent > section > div > Child > div > Leaf > span
      // Parent > section > div > Child > div > Leaf > span > b
      // Parent > section > div > hr
      // Parent > section > div > Leaf > span
      // Parent > section > div > Leaf > span > b
      hostUpdateCounter: 10,
    });
  });
});
