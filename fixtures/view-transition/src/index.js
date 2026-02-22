import Devjs from 'devjs';
import {hydrateRoot} from 'devjs-dom/client';

import App from './components/App.js';

hydrateRoot(
  document,
  <App
    assets={window.assetManifest}
    initialURL={document.location.pathname + document.location.search}
  />
);
