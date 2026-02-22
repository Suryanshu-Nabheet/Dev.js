const semver = require('semver');
const fs = require('fs');
const DevjsVersionSrc = fs.readFileSync(require.resolve('shared/DevjsVersion'));
const devjsVersion = /export default '([^']+)';/.exec(DevjsVersionSrc)[1];

const config = {
  use: {
    headless: true,
    browserName: 'chromium',
    launchOptions: {
      // This bit of delay gives async Devjs time to render
      // and DevTools operations to be sent across the bridge.
      slowMo: 100,
    },
    url: process.env.devjs_VERSION
      ? 'http://localhost:8080/e2e-regression.html'
      : 'http://localhost:8080/e2e.html',
    devjs_version: process.env.devjs_VERSION
      ? semver.coerce(process.env.devjs_VERSION).version
      : devjsVersion,
    trace: 'retain-on-failure',
  },
  // Some of our e2e tests can be flaky. Retry tests to make sure the error isn't transient
  retries: 3,
};

module.exports = config;
