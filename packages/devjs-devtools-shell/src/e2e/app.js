/** @flow */

// This test harness mounts each test app as a separate root to test multi-root applications.

import * as Devjs from 'devjs';
import * as DevjsDOMClient from 'devjs-dom/client';

const container = document.createElement('div');

((document.body: any): HTMLBodyElement).appendChild(container);

// TODO We may want to parameterize this app
// so that it can load things other than just ToDoList.
const App = require('../e2e-apps/ListApp').default;

const root = DevjsDOMClient.createRoot(container);
root.render(<App />);

// DevjsDOM Test Selector APIs used by Playwright e2e tests
window.parent.devjs_DOM_APP = DevjsDOMClient;
