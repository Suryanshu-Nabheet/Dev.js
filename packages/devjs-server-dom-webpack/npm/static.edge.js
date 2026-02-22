'use strict';

var s;
if (process.env.NODE_ENV === 'production') {
  s = require('./cjs/devjs-server-dom-webpack-server.edge.production.js');
} else {
  s = require('./cjs/devjs-server-dom-webpack-server.edge.development.js');
}

exports.prerender = s.prerender;
