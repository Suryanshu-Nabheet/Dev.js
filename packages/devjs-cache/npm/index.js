'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-cache.production.js');
} else {
  module.exports = require('./cjs/devjs-cache.development.js');
}
