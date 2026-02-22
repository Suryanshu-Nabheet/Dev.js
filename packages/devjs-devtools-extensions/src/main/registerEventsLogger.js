/* global chrome */

import {registerDevToolsEventLogger} from 'devjs-devtools-shared/src/registerDevToolsEventLogger';

function registerEventsLogger() {
  registerDevToolsEventLogger('extension', async () => {
    const tabs = await chrome.tabs.query({active: true});
    return {page_url: tabs[0]?.url};
  });
}

export default registerEventsLogger;
