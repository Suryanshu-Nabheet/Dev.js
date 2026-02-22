/** @flow */

// This test harness mounts each test app as a separate root to test multi-root applications.

import * as Devjs from 'devjs';
import * as DevjsDOMClient from 'devjs-dom/client';
import ListApp from '../e2e-apps/ListApp';

function mountApp(App: () => Devjs$Node) {
  const container = document.createElement('div');

  ((document.body: any): HTMLBodyElement).appendChild(container);

  const root = DevjsDOMClient.createRoot(container);
  root.render(<App />);
}
function mountTestApp() {
  mountApp(ListApp);
}

mountTestApp();

// DevjsDOM Test Selector APIs used by Playwright e2e tests
// If they don't exist, we mock them
window.parent.devjs_DOM_APP = {
  createTestNameSelector: name => `[data-testname="${name}"]`,
  findAllNodes: (container, nodes) =>
    container.querySelectorAll(nodes.join(' ')),
  ...DevjsDOMClient,
};
