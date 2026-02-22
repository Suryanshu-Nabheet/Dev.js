import Devjs from 'devjs';
import {Profiler} from 'devjs';
import {hydrateRoot} from 'devjs-dom/client';

import App from './components/App';

hydrateRoot(
  document,
  <Profiler id="root">
    <App assets={window.assetManifest} />
  </Profiler>
);
