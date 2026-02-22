/* global chrome */

'use strict';

function setExtensionIconAndPopup(devjsBuildType, tabId) {
  chrome.action.setIcon({
    tabId,
    path: {
      '16': chrome.runtime.getURL(`icons/16-${devjsBuildType}.png`),
      '32': chrome.runtime.getURL(`icons/32-${devjsBuildType}.png`),
      '48': chrome.runtime.getURL(`icons/48-${devjsBuildType}.png`),
      '128': chrome.runtime.getURL(`icons/128-${devjsBuildType}.png`),
    },
  });

  chrome.action.setPopup({
    tabId,
    popup: chrome.runtime.getURL(`popups/${devjsBuildType}.html`),
  });
}

export default setExtensionIconAndPopup;
