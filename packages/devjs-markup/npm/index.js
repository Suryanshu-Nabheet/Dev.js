'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/devjs-markup.production.js');
} else {
  module.exports = require('./cjs/devjs-markup.development.js');
}
