'use strict';

var s;
if (process.env.NODE_ENV === 'production') {
  s = require('./cjs/devjs-server-dom-webpack-server.node.production.js');
} else {
  s = require('./cjs/devjs-server-dom-webpack-server.node.development.js');
}

exports.prerender = s.prerender;
exports.prerenderToNodeStream = s.prerenderToNodeStream;
