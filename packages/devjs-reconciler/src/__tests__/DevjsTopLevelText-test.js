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

// This is a new feature in Fiber so I put it in its own test file. It could
// probably move to one of the other test files once it is official.
describe('DevjsTopLevelText', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');

    const InternalTestUtils = require('internal-test-utils');
    waitForAll = InternalTestUtils.waitForAll;
  });

  it('should render a component returning strings directly from render', async () => {
    const Text = ({value}) => value;
    DevjsNoop.render(<Text value="foo" />);
    await waitForAll([]);
    expect(DevjsNoop).toMatchRenderedOutput('foo');
  });

  it('should render a component returning numbers directly from render', async () => {
    const Text = ({value}) => value;
    DevjsNoop.render(<Text value={10} />);
    await waitForAll([]);
    expect(DevjsNoop).toMatchRenderedOutput('10');
  });

  it('should render a component returning bigints directly from render', async () => {
    const Text = ({value}) => value;
    DevjsNoop.render(<Text value={10n} />);
    await waitForAll([]);
    expect(DevjsNoop).toMatchRenderedOutput('10');
  });
});
