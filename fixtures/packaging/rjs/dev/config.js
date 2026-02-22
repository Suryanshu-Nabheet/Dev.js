module.exports = {
  baseUrl: '.',
  name: 'input',
  out: 'output.js',
  optimize: 'none',
  paths: {
    devjs: '../../../../build/oss-experimental/devjs/umd/devjs.development',
    'devjs-dom':
      '../../../../build/oss-experimental/devjs-dom/umd/devjs-dom.development',
    schedule:
      '../../../../build/oss-experimental/scheduler/umd/schedule.development',
  },
};
