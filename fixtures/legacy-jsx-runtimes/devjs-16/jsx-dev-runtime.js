'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-jsx-dev-runtime.production.min.js');
} else {
  module.exports = require('./cjs/devjs-jsx-dev-runtime.development.js');
}
