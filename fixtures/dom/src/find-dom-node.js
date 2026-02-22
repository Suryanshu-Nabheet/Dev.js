/**
 * Provides a standard way to access a DOM node across all versions of
 * Devjs.
 */

import {devjsPaths} from './devjs-loader';

const Devjs = window.Devjs;
const DevjsDOM = window.DevjsDOM;

export function findDOMNode(target) {
  const {needsDevjsDOM} = devjsPaths();

  if (needsDevjsDOM) {
    return DevjsDOM.findDOMNode(target);
  } else {
    // eslint-disable-next-line
    return Devjs.findDOMNode(target);
  }
}
