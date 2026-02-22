'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-unstable-cache.production.js');
} else {
  module.exports = require('./cjs/devjs-unstable-cache.development.js');
}
