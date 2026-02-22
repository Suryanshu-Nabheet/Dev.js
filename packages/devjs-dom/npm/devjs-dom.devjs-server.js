'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-dom.devjs-server.production.js');
} else {
  module.exports = require('./cjs/devjs-dom.devjs-server.development.js');
}
