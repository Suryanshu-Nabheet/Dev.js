/** @flow */

// This test harness mounts each test app as a separate root to test multi-root applications.

import * as Devjs from 'devjs';
import {createRoot} from 'devjs-dom/client';
import App from './apps/index';

function mountApp() {
  const container = document.createElement('div');

  ((document.body: any): HTMLBodyElement).appendChild(container);

  const root = createRoot(container);
  root.render(
    <Devjs.StrictMode>
      <App />
    </Devjs.StrictMode>,
  );
}

mountApp();
