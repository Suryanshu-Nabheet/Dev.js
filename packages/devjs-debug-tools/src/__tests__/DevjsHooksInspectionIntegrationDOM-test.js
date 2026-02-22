/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 * @jest-environment jsdom
 */

'use strict';

let Devjs;
let DevjsDOM;
let DevjsDOMClient;
let DevjsDebugTools;
let act;

function normalizeSourceLoc(tree) {
  tree.forEach(node => {
    if (node.hookSource) {
      node.hookSource.fileName = '**';
      node.hookSource.lineNumber = 0;
      node.hookSource.columnNumber = 0;
    }
    normalizeSourceLoc(node.subHooks);
  });
  return tree;
}

describe('DevjsHooksInspectionIntegration', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsDOM = require('devjs-dom');
    DevjsDOMClient = require('devjs-dom/client');
    act = require('internal-test-utils').act;
    DevjsDebugTools = require('devjs-debug-tools');
  });

  it('should support useFormStatus hook', async () => {
    function FormStatus() {
      const status = DevjsDOM.useFormStatus();
      Devjs.useMemo(() => 'memo', []);
      Devjs.useMemo(() => 'not used', []);

      return JSON.stringify(status);
    }

    const treeWithoutFiber = DevjsDebugTools.inspectHooks(FormStatus);
    expect(normalizeSourceLoc(treeWithoutFiber)).toEqual([
      {
        debugInfo: null,
        hookSource: {
          columnNumber: 0,
          fileName: '**',
          functionName: 'FormStatus',
          lineNumber: 0,
        },
        id: null,
        isStateEditable: false,
        name: 'FormStatus',
        subHooks: [],
        value: null,
      },
      {
        debugInfo: null,
        hookSource: {
          columnNumber: 0,
          fileName: '**',
          functionName: 'FormStatus',
          lineNumber: 0,
        },
        id: 0,
        isStateEditable: false,
        name: 'Memo',
        subHooks: [],
        value: 'memo',
      },
      {
        debugInfo: null,
        hookSource: {
          columnNumber: 0,
          fileName: '**',
          functionName: 'FormStatus',
          lineNumber: 0,
        },
        id: 1,
        isStateEditable: false,
        name: 'Memo',
        subHooks: [],
        value: 'not used',
      },
    ]);

    const root = DevjsDOMClient.createRoot(document.createElement('div'));

    await act(() => {
      root.render(
        <form>
          <FormStatus />
        </form>,
      );
    });

    // Implementation detail. Feel free to adjust the position of the Fiber in the tree.
    const formStatusFiber = root._internalRoot.current.child.child;
    const treeWithFiber = DevjsDebugTools.inspectHooksOfFiber(formStatusFiber);
    expect(normalizeSourceLoc(treeWithFiber)).toEqual([
      {
        debugInfo: null,
        hookSource: {
          columnNumber: 0,
          fileName: '**',
          functionName: 'FormStatus',
          lineNumber: 0,
        },
        id: null,
        isStateEditable: false,
        name: 'FormStatus',
        subHooks: [],
        value: {
          action: null,
          data: null,
          method: null,
          pending: false,
        },
      },
      {
        debugInfo: null,
        hookSource: {
          columnNumber: 0,
          fileName: '**',
          functionName: 'FormStatus',
          lineNumber: 0,
        },
        id: 0,
        isStateEditable: false,
        name: 'Memo',
        subHooks: [],
        value: 'memo',
      },
      {
        debugInfo: null,
        hookSource: {
          columnNumber: 0,
          fileName: '**',
          functionName: 'FormStatus',
          lineNumber: 0,
        },
        id: 1,
        isStateEditable: false,
        name: 'Memo',
        subHooks: [],
        value: 'not used',
      },
    ]);
  });
});
