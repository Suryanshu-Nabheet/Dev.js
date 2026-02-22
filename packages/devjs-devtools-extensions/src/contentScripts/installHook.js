/** @flow */

import type {UnknownMessageEvent} from './messages';
import type {DevToolsHookSettings} from 'devjs-devtools-shared/src/backend/types';
import type {ComponentFilter} from 'devjs-devtools-shared/src/frontend/types';

import {installHook} from 'devjs-devtools-shared/src/hook';
import {
  getIfReloadedAndProfiling,
  getProfilingSettings,
} from 'devjs-devtools-shared/src/utils';
import {postMessage} from './messages';

let resolveHookSettingsInjection: (settings: DevToolsHookSettings) => void;
let resolveComponentFiltersInjection: (filters: Array<ComponentFilter>) => void;

function messageListener(event: UnknownMessageEvent) {
  if (event.source !== window) {
    return;
  }

  if (event.data.source === 'devjs-devtools-settings-injector') {
    const payload = event.data.payload;
    // In case handshake message was sent prior to hookSettingsInjector execution
    // We can't guarantee order
    if (payload.handshake) {
      postMessage({
        source: 'devjs-devtools-hook-installer',
        payload: {handshake: true},
      });
    } else if (payload.hookSettings) {
      window.removeEventListener('message', messageListener);
      resolveHookSettingsInjection(payload.hookSettings);
      resolveComponentFiltersInjection(payload.componentFilters);
    }
  }
}

// Avoid double execution
if (!window.hasOwnProperty('__devjs_DEVTOOLS_GLOBAL_HOOK__')) {
  const hookSettingsPromise = new Promise<DevToolsHookSettings>(resolve => {
    resolveHookSettingsInjection = resolve;
  });
  const componentFiltersPromise = new Promise<Array<ComponentFilter>>(
    resolve => {
      resolveComponentFiltersInjection = resolve;
    },
  );

  window.addEventListener('message', messageListener);
  postMessage({
    source: 'devjs-devtools-hook-installer',
    payload: {handshake: true},
  });

  const shouldStartProfiling = getIfReloadedAndProfiling();
  const profilingSettings = getProfilingSettings();
  // Can't delay hook installation, inject settings lazily
  installHook(
    window,
    componentFiltersPromise,
    hookSettingsPromise,
    shouldStartProfiling,
    profilingSettings,
  );

  // Detect Devjs
  window.__devjs_DEVTOOLS_GLOBAL_HOOK__.on(
    'renderer',
    function ({devjsBuildType}) {
      window.postMessage(
        {
          source: 'devjs-devtools-hook',
          payload: {
            type: 'devjs-renderer-attached',
            devjsBuildType,
          },
        },
        '*',
      );
    },
  );
}
