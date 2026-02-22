'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-client-flight.production.js');
} else {
  module.exports = require('./cjs/devjs-client-flight.development.js');
}
