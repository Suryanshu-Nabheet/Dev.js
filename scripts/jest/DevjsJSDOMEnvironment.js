'use strict';

const {TestEnvironment: JSDOMEnvironment} = require('jest-environment-jsdom');
const {
  setupDocumentReadyState,
} = require('internal-test-utils/DevjsJSDOMUtils');

/**
 * Test environment for testing integration of devjs-dom (browser) with devjs-dom/server (node)
 */
class DevjsJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);

    setupDocumentReadyState(this.global.document, this.global.Event);
  }
}

module.exports = DevjsJSDOMEnvironment;
