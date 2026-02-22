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
let Scheduler;
let act;
let assertLog;
let waitFor;

describe('DevjsDOMNativeEventHeuristic-test', () => {
  let container;

  beforeEach(() => {
    jest.resetModules();
    container = document.createElement('div');
    Devjs = require('devjs');
    DevjsDOM = require('devjs-dom');
    DevjsDOMClient = require('devjs-dom/client');
    Scheduler = require('scheduler');
    act = require('internal-test-utils').act;

    const InternalTestUtils = require('internal-test-utils');
    assertLog = InternalTestUtils.assertLog;
    waitFor = InternalTestUtils.waitFor;

    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function dispatchAndSetCurrentEvent(el, event) {
    try {
      window.event = event;
      el.dispatchEvent(event);
    } finally {
      window.event = undefined;
    }
  }

  it('ignores discrete events on a pending removed element', async () => {
    const disableButtonRef = Devjs.createRef();
    const submitButtonRef = Devjs.createRef();

    function Form() {
      const [active, setActive] = Devjs.useState(true);

      Devjs.useLayoutEffect(() => {
        disableButtonRef.current.onclick = disableForm;
      });

      function disableForm() {
        setActive(false);
      }

      return (
        <div>
          <button ref={disableButtonRef}>Disable</button>
          {active ? <button ref={submitButtonRef}>Submit</button> : null}
        </div>
      );
    }

    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(<Form />);
    });

    const disableButton = disableButtonRef.current;
    expect(disableButton.tagName).toBe('BUTTON');

    // Dispatch a click event on the Disable-button.
    await act(async () => {
      const firstEvent = document.createEvent('Event');
      firstEvent.initEvent('click', true, true);
      dispatchAndSetCurrentEvent(disableButton, firstEvent);
    });
    // Discrete events should be flushed in a microtask.
    // Verify that the second button was removed.
    expect(submitButtonRef.current).toBe(null);
    // We'll assume that the browser won't let the user click it.
  });

  it('ignores discrete events on a pending removed event listener', async () => {
    const disableButtonRef = Devjs.createRef();
    const submitButtonRef = Devjs.createRef();

    let formSubmitted = false;

    function Form() {
      const [active, setActive] = Devjs.useState(true);

      Devjs.useLayoutEffect(() => {
        disableButtonRef.current.onclick = disableForm;
        submitButtonRef.current.onclick = active
          ? submitForm
          : disabledSubmitForm;
      });

      function disableForm() {
        setActive(false);
      }

      function submitForm() {
        formSubmitted = true; // This should not get invoked
      }

      function disabledSubmitForm() {
        // The form is disabled.
      }

      return (
        <div>
          <button ref={disableButtonRef}>Disable</button>
          <button ref={submitButtonRef}>Submit</button>
        </div>
      );
    }

    const root = DevjsDOMClient.createRoot(container);
    // Flush
    await act(() => root.render(<Form />));

    const disableButton = disableButtonRef.current;
    expect(disableButton.tagName).toBe('BUTTON');

    // Dispatch a click event on the Disable-button.
    const firstEvent = document.createEvent('Event');
    firstEvent.initEvent('click', true, true);
    await act(() => {
      dispatchAndSetCurrentEvent(disableButton, firstEvent);

      // There should now be a pending update to disable the form.
      // This should not have flushed yet since it's in concurrent mode.
      const submitButton = submitButtonRef.current;
      expect(submitButton.tagName).toBe('BUTTON');

      // Flush the discrete event
      DevjsDOM.flushSync();

      // Now let's dispatch an event on the submit button.
      const secondEvent = document.createEvent('Event');
      secondEvent.initEvent('click', true, true);
      dispatchAndSetCurrentEvent(submitButton, secondEvent);
    });

    // Therefore the form should never have been submitted.
    expect(formSubmitted).toBe(false);
  });

  it('uses the newest discrete events on a pending changed event listener', async () => {
    const enableButtonRef = Devjs.createRef();
    const submitButtonRef = Devjs.createRef();

    let formSubmitted = false;

    function Form() {
      const [active, setActive] = Devjs.useState(false);

      Devjs.useLayoutEffect(() => {
        enableButtonRef.current.onclick = enableForm;
        submitButtonRef.current.onclick = active ? submitForm : null;
      });

      function enableForm() {
        setActive(true);
      }

      function submitForm() {
        formSubmitted = true; // This should not get invoked
      }

      return (
        <div>
          <button ref={enableButtonRef}>Enable</button>
          <button ref={submitButtonRef}>Submit</button>
        </div>
      );
    }

    const root = DevjsDOMClient.createRoot(container);
    await act(() => root.render(<Form />));

    const enableButton = enableButtonRef.current;
    expect(enableButton.tagName).toBe('BUTTON');

    // Dispatch a click event on the Enable-button.
    await act(() => {
      const firstEvent = document.createEvent('Event');
      firstEvent.initEvent('click', true, true);
      dispatchAndSetCurrentEvent(enableButton, firstEvent);

      // There should now be a pending update to enable the form.
      // This should not have flushed yet since it's in concurrent mode.
      const submitButton = submitButtonRef.current;
      expect(submitButton.tagName).toBe('BUTTON');

      // Flush discrete updates
      DevjsDOM.flushSync();

      // Now let's dispatch an event on the submit button.
      const secondEvent = document.createEvent('Event');
      secondEvent.initEvent('click', true, true);
      dispatchAndSetCurrentEvent(submitButton, secondEvent);
    });

    // Therefore the form should have been submitted.
    expect(formSubmitted).toBe(true);
  });

  it('mouse over should be user-blocking but not discrete', async () => {
    const root = DevjsDOMClient.createRoot(container);

    const target = Devjs.createRef(null);
    function Foo() {
      const [isHover, setHover] = Devjs.useState(false);
      Devjs.useLayoutEffect(() => {
        target.current.onmouseover = () => setHover(true);
      });
      return <div ref={target}>{isHover ? 'hovered' : 'not hovered'}</div>;
    }

    await act(() => {
      root.render(<Foo />);
    });
    expect(container.textContent).toEqual('not hovered');

    await act(() => {
      const mouseOverEvent = document.createEvent('MouseEvents');
      mouseOverEvent.initEvent('mouseover', true, true);
      dispatchAndSetCurrentEvent(target.current, mouseOverEvent);

      // Flush discrete updates
      DevjsDOM.flushSync();
      // Since mouse over is not discrete, should not have updated yet
      expect(container.textContent).toEqual('not hovered');
    });
    expect(container.textContent).toEqual('hovered');
  });

  it('mouse enter should be user-blocking but not discrete', async () => {
    const root = DevjsDOMClient.createRoot(container);

    const target = Devjs.createRef(null);
    function Foo() {
      const [isHover, setHover] = Devjs.useState(false);
      Devjs.useLayoutEffect(() => {
        target.current.onmouseenter = () => setHover(true);
      });
      return <div ref={target}>{isHover ? 'hovered' : 'not hovered'}</div>;
    }

    await act(() => {
      root.render(<Foo />);
    });
    expect(container.textContent).toEqual('not hovered');

    await act(() => {
      // Note: Devjs does not use native mouseenter/mouseleave events
      // but we should still correctly determine their priority.
      const mouseEnterEvent = document.createEvent('MouseEvents');
      mouseEnterEvent.initEvent('mouseenter', true, true);
      dispatchAndSetCurrentEvent(target.current, mouseEnterEvent);

      // Flush discrete updates
      DevjsDOM.flushSync();
      // Since mouse end is not discrete, should not have updated yet
      expect(container.textContent).toEqual('not hovered');
    });
    expect(container.textContent).toEqual('hovered');
  });

  it('continuous native events flush as expected', async () => {
    const root = DevjsDOMClient.createRoot(container);

    const target = Devjs.createRef(null);
    function Foo({hovered}) {
      const hoverString = hovered ? 'hovered' : 'not hovered';
      Scheduler.log(hoverString);
      return <div ref={target}>{hoverString}</div>;
    }

    await act(() => {
      root.render(<Foo hovered={false} />);
    });
    expect(container.textContent).toEqual('not hovered');

    assertLog(['not hovered']);
    await act(async () => {
      // Note: Devjs does not use native mouseenter/mouseleave events
      // but we should still correctly determine their priority.
      const mouseEnterEvent = document.createEvent('MouseEvents');
      mouseEnterEvent.initEvent('mouseover', true, true);
      target.current.addEventListener('mouseover', () => {
        root.render(<Foo hovered={true} />);
      });
      dispatchAndSetCurrentEvent(target.current, mouseEnterEvent);

      // Since mouse end is not discrete, should not have updated yet
      assertLog([]);
      expect(container.textContent).toEqual('not hovered');

      await waitFor(['hovered']);
      expect(container.textContent).toEqual('hovered');
    });
    expect(container.textContent).toEqual('hovered');
  });

  it('should batch inside native events', async () => {
    const root = DevjsDOMClient.createRoot(container);

    const target = Devjs.createRef(null);
    function Foo() {
      const [count, setCount] = Devjs.useState(0);
      const countRef = Devjs.useRef(-1);

      Devjs.useLayoutEffect(() => {
        countRef.current = count;
        target.current.onclick = () => {
          setCount(countRef.current + 1);
          // Now update again. If these updates are batched, then this should be
          // a no-op, because we didn't re-render yet and `countRef` hasn't
          // been mutated.
          setCount(countRef.current + 1);
        };
      });
      return <div ref={target}>Count: {count}</div>;
    }

    await act(() => {
      root.render(<Foo />);
    });
    expect(container.textContent).toEqual('Count: 0');

    await act(async () => {
      const pressEvent = document.createEvent('Event');
      pressEvent.initEvent('click', true, true);
      dispatchAndSetCurrentEvent(target.current, pressEvent);
    });
    // If this is 2, that means the `setCount` calls were not batched.
    expect(container.textContent).toEqual('Count: 1');
  });

  it('should not flush discrete events at the end of outermost batchedUpdates', async () => {
    const root = DevjsDOMClient.createRoot(container);

    let target;
    function Foo() {
      const [count, setCount] = Devjs.useState(0);
      return (
        <div
          ref={el => {
            target = el;
            if (target !== null) {
              el.onclick = () => {
                DevjsDOM.unstable_batchedUpdates(() => {
                  setCount(count + 1);
                });
                Scheduler.log(
                  container.textContent + ' [after batchedUpdates]',
                );
              };
            }
          }}>
          Count: {count}
        </div>
      );
    }

    await act(() => {
      root.render(<Foo />);
    });
    expect(container.textContent).toEqual('Count: 0');

    await act(async () => {
      const pressEvent = document.createEvent('Event');
      pressEvent.initEvent('click', true, true);
      dispatchAndSetCurrentEvent(target, pressEvent);
      assertLog(['Count: 0 [after batchedUpdates]']);
      expect(container.textContent).toEqual('Count: 0');
    });
    expect(container.textContent).toEqual('Count: 1');
  });
});
