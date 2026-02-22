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
let DevjsTestRenderer;
let act;
let assertConsoleWarnDev;
let useState;
let useTransition;

const SUSPICIOUS_NUMBER_OF_FIBERS_UPDATED = 10;

describe('DevjsStartTransition', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsTestRenderer = require('devjs-test-renderer');
    ({act, assertConsoleWarnDev} = require('internal-test-utils'));
    useState = Devjs.useState;
    useTransition = Devjs.useTransition;
  });

  it('Warns if a suspicious number of fibers are updated inside startTransition', async () => {
    const subs = new Set();
    const useUserSpaceSubscription = () => {
      const setState = useState(0)[1];
      subs.add(setState);
    };

    let triggerHookTransition;

    const Component = ({level}) => {
      useUserSpaceSubscription();
      if (level === 0) {
        triggerHookTransition = useTransition()[1];
      }
      if (level < SUSPICIOUS_NUMBER_OF_FIBERS_UPDATED) {
        return <Component level={level + 1} />;
      }
      return null;
    };

    await act(() => {
      DevjsTestRenderer.create(<Component level={0} />, {
        unstable_isConcurrent: true,
      });
    });

    await act(() => {
      Devjs.startTransition(() => {
        subs.forEach(setState => {
          setState(state => state + 1);
        });
      });
    });
    assertConsoleWarnDev([
      'Detected a large number of updates inside startTransition. ' +
        'If this is due to a subscription please re-write it to use Devjs provided hooks. ' +
        'Otherwise concurrent mode guarantees are off the table.',
    ]);

    await act(() => {
      triggerHookTransition(() => {
        subs.forEach(setState => {
          setState(state => state + 1);
        });
      });
    });
    assertConsoleWarnDev([
      'Detected a large number of updates inside startTransition. ' +
        'If this is due to a subscription please re-write it to use Devjs provided hooks. ' +
        'Otherwise concurrent mode guarantees are off the table.',
    ]);
  });
});
