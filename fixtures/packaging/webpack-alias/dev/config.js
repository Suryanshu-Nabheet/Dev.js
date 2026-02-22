var path = require('path');

module.exports = {
  entry: './input',
  output: {
    filename: 'output.js',
  },
  resolve: {
    root: path.resolve('../../../../build/oss-experimental'),
    alias: {
      devjs: 'devjs/umd/devjs.development',
      'devjs-dom': 'devjs-dom/umd/devjs-dom.development',
    },
  },
};
