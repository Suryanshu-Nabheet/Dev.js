'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-noop-renderer.production.js');
} else {
  module.exports = require('./cjs/devjs-noop-renderer.development.js');
}
