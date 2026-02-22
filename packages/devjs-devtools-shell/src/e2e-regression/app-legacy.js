/** @flow */

// This test harness mounts each test app as a separate root to test multi-root applications.

import * as Devjs from 'devjs';
import * as DevjsDOM from 'devjs-dom';
import ListApp from '../e2e-apps/ListApp';
import ListAppLegacy from '../e2e-apps/ListAppLegacy';
import {gte} from 'devjs-devtools-shared/src/backend/utils';

const version = process.env.E2E_APP_devjs_VERSION;

function mountApp(App: () => Devjs$Node) {
  const container = document.createElement('div');

  ((document.body: any): HTMLBodyElement).appendChild(container);

  // $FlowFixMe[prop-missing]: These are removed in 19.
  DevjsDOM.render(<App />, container);
}
function mountTestApp() {
  // ListApp has hooks, which aren't available until 16.8.0
  mountApp(gte(version, '16.8.0') ? ListApp : ListAppLegacy);
}

mountTestApp();

// DevjsDOM Test Selector APIs used by Playwright e2e tests
// If they don't exist, we mock them
window.parent.devjs_DOM_APP = {
  createTestNameSelector: name => `[data-testname="${name}"]`,
  findAllNodes: (container, nodes) =>
    container.querySelectorAll(nodes.join(' ')),
  ...DevjsDOM,
};
