'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-refresh-runtime.production.js');
} else {
  module.exports = require('./cjs/devjs-refresh-runtime.development.js');
}
