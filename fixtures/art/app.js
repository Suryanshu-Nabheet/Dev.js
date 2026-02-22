'use strict';

var Devjs = require('devjs');
var DevjsDOM = require('devjs-dom');
var VectorWidget = require('./VectorWidget');

DevjsDOM.render(<VectorWidget />, document.getElementById('container'));
