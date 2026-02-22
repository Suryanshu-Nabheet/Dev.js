module.exports = {
  baseUrl: '.',
  name: 'input',
  out: 'output.js',
  optimize: 'none',
  paths: {
    devjs: '../../../../build/oss-experimental/devjs/umd/devjs.production.min',
    'devjs-dom':
      '../../../../build/oss-experimental/devjs-dom/umd/devjs-dom.production.min',
    schedule:
      '../../../../build/oss-experimental/scheduler/umd/schedule.development',
  },
};
