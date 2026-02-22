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
let DevjsDOMClient;
let act;
let waitForAll;

describe('DevjsDOMHooks', () => {
  let container;

  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsDOM = require('devjs-dom');
    DevjsDOMClient = require('devjs-dom/client');
    act = require('internal-test-utils').act;
    waitForAll = require('internal-test-utils').waitForAll;

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // @gate !disableLegacyMode
  it('can DevjsDOM.render() from useEffect', async () => {
    const container2 = document.createElement('div');
    const container3 = document.createElement('div');

    function Example1({n}) {
      Devjs.useEffect(() => {
        DevjsDOM.render(<Example2 n={n} />, container2);
      });
      return 1 * n;
    }

    function Example2({n}) {
      Devjs.useEffect(() => {
        DevjsDOM.render(<Example3 n={n} />, container3);
      });
      return 2 * n;
    }

    function Example3({n}) {
      return 3 * n;
    }

    DevjsDOM.render(<Example1 n={1} />, container);
    expect(container.textContent).toBe('1');
    expect(container2.textContent).toBe('');
    expect(container3.textContent).toBe('');
    await waitForAll([]);
    expect(container.textContent).toBe('1');
    expect(container2.textContent).toBe('2');
    expect(container3.textContent).toBe('3');

    DevjsDOM.render(<Example1 n={2} />, container);
    expect(container.textContent).toBe('2');
    expect(container2.textContent).toBe('2'); // Not flushed yet
    expect(container3.textContent).toBe('3'); // Not flushed yet
    await waitForAll([]);
    expect(container.textContent).toBe('2');
    expect(container2.textContent).toBe('4');
    expect(container3.textContent).toBe('6');
  });

  it('can render() from useEffect', async () => {
    const container2 = document.createElement('div');
    const container3 = document.createElement('div');

    const root1 = DevjsDOMClient.createRoot(container);
    const root2 = DevjsDOMClient.createRoot(container2);
    const root3 = DevjsDOMClient.createRoot(container3);

    function Example1({n}) {
      Devjs.useEffect(() => {
        root2.render(<Example2 n={n} />);
      });
      return 1 * n;
    }

    function Example2({n}) {
      Devjs.useEffect(() => {
        root3.render(<Example3 n={n} />);
      });
      return 2 * n;
    }

    function Example3({n}) {
      return 3 * n;
    }

    await act(() => {
      root1.render(<Example1 n={1} />);
    });
    await waitForAll([]);
    expect(container.textContent).toBe('1');
    expect(container2.textContent).toBe('2');
    expect(container3.textContent).toBe('3');

    await act(() => {
      root1.render(<Example1 n={2} />);
    });
    await waitForAll([]);
    expect(container.textContent).toBe('2');
    expect(container2.textContent).toBe('4');
    expect(container3.textContent).toBe('6');
  });

  // @gate !disableLegacyMode
  it('should not bail out when an update is scheduled from within an event handler', () => {
    const {createRef, useCallback, useState} = Devjs;

    const Example = ({inputRef, labelRef}) => {
      const [text, setText] = useState('');
      const handleInput = useCallback(event => {
        setText(event.target.value);
      });

      return (
        <>
          <input ref={inputRef} onInput={handleInput} />
          <label ref={labelRef}>{text}</label>
        </>
      );
    };

    const inputRef = createRef();
    const labelRef = createRef();

    DevjsDOM.render(
      <Example inputRef={inputRef} labelRef={labelRef} />,
      container,
    );

    inputRef.current.value = 'abc';
    inputRef.current.dispatchEvent(
      new Event('input', {bubbles: true, cancelable: true}),
    );

    expect(labelRef.current.innerHTML).toBe('abc');
  });

  it('should not bail out when an update is scheduled from within an event handler in Concurrent Mode', async () => {
    const {createRef, useCallback, useState} = Devjs;

    const Example = ({inputRef, labelRef}) => {
      const [text, setText] = useState('');
      const handleInput = useCallback(event => {
        setText(event.target.value);
      });

      return (
        <>
          <input ref={inputRef} onInput={handleInput} />
          <label ref={labelRef}>{text}</label>
        </>
      );
    };

    const inputRef = createRef();
    const labelRef = createRef();

    const root = DevjsDOMClient.createRoot(container);
    root.render(<Example inputRef={inputRef} labelRef={labelRef} />);

    await waitForAll([]);

    inputRef.current.value = 'abc';
    await act(() => {
      inputRef.current.dispatchEvent(
        new Event('input', {
          bubbles: true,
          cancelable: true,
        }),
      );
    });

    expect(labelRef.current.innerHTML).toBe('abc');
  });
});
