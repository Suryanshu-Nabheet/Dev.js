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
let Scheduler;
let act;
let useEffect;
let useLayoutEffect;
let assertLog;

describe('DevjsEffectOrdering', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');
    Scheduler = require('scheduler');
    act = require('internal-test-utils').act;
    useEffect = Devjs.useEffect;
    useLayoutEffect = Devjs.useLayoutEffect;

    const InternalTestUtils = require('internal-test-utils');
    assertLog = InternalTestUtils.assertLog;
  });

  it('layout unmounts on deletion are fired in parent -> child order', async () => {
    const root = DevjsNoop.createRoot();

    function Parent() {
      useLayoutEffect(() => {
        return () => Scheduler.log('Unmount parent');
      });
      return <Child />;
    }

    function Child() {
      useLayoutEffect(() => {
        return () => Scheduler.log('Unmount child');
      });
      return 'Child';
    }

    await act(() => {
      root.render(<Parent />);
    });
    expect(root).toMatchRenderedOutput('Child');
    await act(() => {
      root.render(null);
    });
    assertLog(['Unmount parent', 'Unmount child']);
  });

  it('passive unmounts on deletion are fired in parent -> child order', async () => {
    const root = DevjsNoop.createRoot();

    function Parent() {
      useEffect(() => {
        return () => Scheduler.log('Unmount parent');
      });
      return <Child />;
    }

    function Child() {
      useEffect(() => {
        return () => Scheduler.log('Unmount child');
      });
      return 'Child';
    }

    await act(() => {
      root.render(<Parent />);
    });
    expect(root).toMatchRenderedOutput('Child');
    await act(() => {
      root.render(null);
    });
    assertLog(['Unmount parent', 'Unmount child']);
  });
});
