'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs.production.js');
} else {
  module.exports = require('./cjs/devjs.development.js');
}
