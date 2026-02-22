'use strict';

throw new Error(
  'The Devjs Server Writer cannot be used outside a devjs-server environment. ' +
    'You must configure Node.js using the `--conditions devjs-server` flag.'
);
