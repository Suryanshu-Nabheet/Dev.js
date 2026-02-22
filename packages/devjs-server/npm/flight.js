'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-server-flight.production.js');
} else {
  module.exports = require('./cjs/devjs-server-flight.development.js');
}
