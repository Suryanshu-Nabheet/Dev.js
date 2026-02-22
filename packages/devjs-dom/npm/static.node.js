'use strict';

var s;
if (process.env.NODE_ENV === 'production') {
  s = require('./cjs/devjs-dom-server.node.production.js');
} else {
  s = require('./cjs/devjs-dom-server.node.development.js');
}

exports.version = s.version;
exports.prerenderToNodeStream = s.prerenderToNodeStream;
exports.prerender = s.prerender;
exports.resumeAndPrerenderToNodeStream = s.resumeAndPrerenderToNodeStream;
exports.resumeAndPrerender = s.resumeAndPrerender;
