'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-jsx-dev-runtime.devjs-server.production.js');
} else {
  module.exports = require('./cjs/devjs-jsx-dev-runtime.devjs-server.development.js');
}
