'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-refresh-babel.production.js');
} else {
  module.exports = require('./cjs/devjs-refresh-babel.development.js');
}
