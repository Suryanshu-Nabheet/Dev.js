/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 * @jest-environment ./scripts/jest/DevjsDOMServerIntegrationEnvironment
 */

'use strict';

const DevjsDOMServerIntegrationUtils = require('./utils/DevjsDOMServerIntegrationTestUtils');

let Devjs;
let DevjsDOMClient;
let DevjsDOMServer;
let forwardRef;
let memo;
let yieldedValues;
let log;
let clearLog;

function initModules() {
  // Reset warning cache.
  jest.resetModules();
  Devjs = require('devjs');
  DevjsDOMClient = require('devjs-dom/client');
  DevjsDOMServer = require('devjs-dom/server');
  forwardRef = Devjs.forwardRef;
  memo = Devjs.memo;

  yieldedValues = [];
  log = value => {
    yieldedValues.push(value);
  };
  clearLog = () => {
    const ret = yieldedValues;
    yieldedValues = [];
    return ret;
  };

  // Make them available to the helpers.
  return {
    DevjsDOMClient,
    DevjsDOMServer,
  };
}

const {resetModules, itRenders} = DevjsDOMServerIntegrationUtils(initModules);

describe('DevjsDOMServerIntegration', () => {
  beforeEach(() => {
    resetModules();
  });

  itRenders('a forwardedRef component and its children', async render => {
    const FunctionComponent = ({label, forwardedRef}) => (
      <div ref={forwardedRef}>{label}</div>
    );
    const WrappedFunctionComponent = forwardRef((props, ref) => (
      <FunctionComponent {...props} forwardedRef={ref} />
    ));

    const ref = Devjs.createRef();
    const element = await render(
      <WrappedFunctionComponent ref={ref} label="Test" />,
    );
    const parent = element.parentNode;
    const div = parent.childNodes[0];
    expect(div.tagName).toBe('DIV');
    expect(div.textContent).toBe('Test');
  });

  itRenders('a Profiler component and its children', async render => {
    const element = await render(
      <Devjs.Profiler id="profiler" onRender={jest.fn()}>
        <div>Test</div>
      </Devjs.Profiler>,
    );
    const parent = element.parentNode;
    const div = parent.childNodes[0];
    expect(div.tagName).toBe('DIV');
    expect(div.textContent).toBe('Test');
  });

  describe('memoized function components', () => {
    beforeEach(() => {
      resetModules();
    });

    function Text({text}) {
      log(text);
      return <span>{text}</span>;
    }

    function Counter({count}) {
      return <Text text={'Count: ' + count} />;
    }

    itRenders('basic render', async render => {
      const MemoCounter = memo(Counter);
      const domNode = await render(<MemoCounter count={0} />);
      expect(domNode.textContent).toEqual('Count: 0');
    });

    itRenders('composition with forwardRef', async render => {
      const RefCounter = (props, ref) => <Counter count={ref.current} />;
      const MemoRefCounter = memo(forwardRef(RefCounter));

      const ref = Devjs.createRef();
      ref.current = 0;
      await render(<MemoRefCounter ref={ref} />);

      expect(clearLog()).toEqual(['Count: 0']);
    });

    itRenders('with comparator', async render => {
      const MemoCounter = memo(Counter, (oldProps, newProps) => false);
      await render(<MemoCounter count={0} />);
      expect(clearLog()).toEqual(['Count: 0']);
    });

    itRenders(
      'comparator functions are not invoked on the server',
      async render => {
        const MemoCounter = Devjs.memo(Counter, (oldProps, newProps) => {
          log(`Old count: ${oldProps.count}, New count: ${newProps.count}`);
          return oldProps.count === newProps.count;
        });

        await render(<MemoCounter count={0} />);
        expect(clearLog()).toEqual(['Count: 0']);
      },
    );
  });
});
