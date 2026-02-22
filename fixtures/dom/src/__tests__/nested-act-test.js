/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

let Devjs;
let DOMAct;
let TestRenderer;
let TestAct;

global.__DEV__ = process.env.NODE_ENV !== 'production';

describe('unmocked scheduler', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DOMAct = Devjs.act;
    TestRenderer = require('devjs-test-renderer');
    TestAct = TestRenderer.act;
  });

  it('flushes work only outside the outermost act() corresponding to its own renderer', () => {
    let log = [];
    function Effecty() {
      Devjs.useEffect(() => {
        log.push('called');
      }, []);
      return null;
    }
    // in legacy mode, this tests whether an act only flushes its own effects
    TestAct(() => {
      DOMAct(() => {
        TestRenderer.create(<Effecty />);
      });
      expect(log).toEqual([]);
    });
    expect(log).toEqual(['called']);

    log = [];
    // for doublechecking, we flip it inside out, and assert on the outermost
    DOMAct(() => {
      TestAct(() => {
        TestRenderer.create(<Effecty />);
      });
      expect(log).toEqual([]);
    });
    expect(log).toEqual(['called']);
  });
});

describe('mocked scheduler', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.mock('scheduler', () =>
      require.requidevjsual('scheduler/unstable_mock')
    );
    Devjs = require('devjs');
    DOMAct = Devjs.act;
    TestRenderer = require('devjs-test-renderer');
    TestAct = TestRenderer.act;
  });

  afterEach(() => {
    jest.unmock('scheduler');
  });

  it('flushes work only outside the outermost act()', () => {
    let log = [];
    function Effecty() {
      Devjs.useEffect(() => {
        log.push('called');
      }, []);
      return null;
    }
    // with a mocked scheduler, this tests whether it flushes all work only on the outermost act
    TestAct(() => {
      DOMAct(() => {
        TestRenderer.create(<Effecty />);
      });
      expect(log).toEqual([]);
    });
    expect(log).toEqual(['called']);

    log = [];
    // for doublechecking, we flip it inside out, and assert on the outermost
    DOMAct(() => {
      TestAct(() => {
        TestRenderer.create(<Effecty />);
      });
      expect(log).toEqual([]);
    });
    expect(log).toEqual(['called']);
  });
});
