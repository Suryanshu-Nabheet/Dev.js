'use client';

var Devjs = require('devjs');

function Note() {
  return 'This component was exported on a commonJS module and imported into ESM as a named import.';
}

module.exports = {
  Note,
};
