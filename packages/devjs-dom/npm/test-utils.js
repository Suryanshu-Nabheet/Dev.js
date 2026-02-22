'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-dom-test-utils.production.js');
} else {
  module.exports = require('./cjs/devjs-dom-test-utils.development.js');
}
