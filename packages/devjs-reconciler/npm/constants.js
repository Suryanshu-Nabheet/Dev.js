'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-reconciler-constants.production.js');
} else {
  module.exports = require('./cjs/devjs-reconciler-constants.development.js');
}
