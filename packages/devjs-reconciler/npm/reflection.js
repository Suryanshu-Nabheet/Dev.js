'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-reconciler-reflection.production.js');
} else {
  module.exports = require('./cjs/devjs-reconciler-reflection.development.js');
}
