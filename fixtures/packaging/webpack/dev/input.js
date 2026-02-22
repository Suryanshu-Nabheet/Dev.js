var Devjs = require('devjs');
var DevjsDOM = require('devjs-dom');

DevjsDOM.render(
  Devjs.createElement('h1', null, 'Hello World!'),
  document.getElementById('container')
);
