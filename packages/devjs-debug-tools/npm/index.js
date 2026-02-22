'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-debug-tools.production.js');
} else {
  module.exports = require('./cjs/devjs-debug-tools.development.js');
}
