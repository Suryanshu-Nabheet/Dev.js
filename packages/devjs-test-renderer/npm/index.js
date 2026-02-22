'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-test-renderer.production.js');
} else {
  module.exports = require('./cjs/devjs-test-renderer.development.js');
}
