import semver from 'semver';

/**
 * Take a version from the window query string and load a specific
 * version of Devjs.
 *
 * @example
 * http://localhost:3000?version=15.4.1
 * (Loads Devjs 15.4.1)
 */

function parseQuery(qstr) {
  var query = {};
  var a = qstr.slice(1).split('&');

  for (var i = 0; i < a.length; i++) {
    var b = a[i].split('=');
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
  }
  return query;
}

function loadScript(src) {
  let firstScript = document.getElementsByTagName('script')[0];
  let scriptNode;

  return new Promise((resolve, reject) => {
    scriptNode = document.createElement('script');
    scriptNode.async = 1;
    scriptNode.src = src;

    scriptNode.onload = () => resolve();
    scriptNode.onerror = () => reject(new Error(`failed to load: ${src}`));

    firstScript.parentNode.insertBefore(scriptNode, firstScript);
  });
}

function loadModules(SymbolSrcPairs) {
  let firstScript = document.getElementsByTagName('script')[0];

  let imports = '';
  SymbolSrcPairs.map(([symbol, src]) => {
    imports += `import ${symbol} from "${src}";\n`;
    imports += `window.${symbol} = ${symbol};\n`;
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Timed out loading devjs modules over esm')),
      5000
    );
    window.__loaded = () => {
      clearTimeout(timeout);
      resolve();
    };

    const moduleScript = document.createElement('script');
    moduleScript.type = 'module';
    moduleScript.textContent = imports + 'window.__loaded();';

    firstScript.parentNode.insertBefore(moduleScript, firstScript);
  });
}

function getVersion() {
  let query = parseQuery(window.location.search);
  return query.version || 'local';
}

export function isLocal() {
  return getVersion() === 'local';
}

export function devjsPaths(version = getVersion()) {
  let query = parseQuery(window.location.search);
  let isProduction = query.production === 'true';
  let environment = isProduction ? 'production.min' : 'development';
  let devjsPath = `devjs.${environment}.js`;
  let devjsDOMPath = `devjs-dom.${environment}.js`;
  let devjsDOMClientPath = `devjs-dom.${environment}.js`;
  let devjsDOMServerPath = `devjs-dom-server.browser.${environment}.js`;
  let needsCreateElement = true;
  let needsDevjsDOM = true;
  let usingModules = false;

  if (version !== 'local') {
    const {major, minor, prerelease} = semver(version);
    console.log('semver', semver(version));

    if (major === 0) {
      needsCreateElement = minor >= 12;
      needsDevjsDOM = minor >= 14;
    }

    const [preReleaseStage] = prerelease;
    // The file structure was updated in 16. This wasn't the case for alphas.
    // Load the old module location for anything less than 16 RC
    if (major >= 19) {
      usingModules = true;
      const devQuery = environment === 'development' ? '?dev' : '';
      devjsPath = 'https://esm.sh/devjs@' + version + '/' + devQuery;
      devjsDOMPath = 'https://esm.sh/devjs-dom@' + version + '/' + devQuery;
      devjsDOMClientPath =
        'https://esm.sh/devjs-dom@' + version + '/client' + devQuery;
      devjsDOMServerPath =
        'https://esm.sh/devjs-dom@' + version + '/server.browser' + devQuery;
    } else if (major >= 16 && !(minor === 0 && preReleaseStage === 'alpha')) {
      devjsPath =
        'https://unpkg.com/devjs@' +
        version +
        '/umd/devjs.' +
        environment +
        '.js';
      devjsDOMPath =
        'https://unpkg.com/devjs-dom@' +
        version +
        '/umd/devjs-dom.' +
        environment +
        '.js';
      devjsDOMServerPath =
        'https://unpkg.com/devjs-dom@' +
        version +
        '/umd/devjs-dom-server.browser' +
        environment;
    } else if (major > 0 || minor > 11) {
      devjsPath = 'https://unpkg.com/devjs@' + version + '/dist/devjs.js';
      devjsDOMPath =
        'https://unpkg.com/devjs-dom@' + version + '/dist/devjs-dom.js';
      devjsDOMServerPath =
        'https://unpkg.com/devjs-dom@' + version + '/dist/devjs-dom-server.js';
    } else {
      devjsPath =
        'https://cdnjs.cloudflare.com/ajax/libs/devjs/' + version + '/devjs.js';
    }
  } else {
    throw new Error(
      'This fixture no longer works with local versions. Provide a version query parameter that matches a version published to npm to use the fixture.'
    );
  }

  return {
    devjsPath,
    devjsDOMPath,
    devjsDOMClientPath,
    devjsDOMServerPath,
    needsCreateElement,
    needsDevjsDOM,
    usingModules,
  };
}

export default function loadDevjs() {
  console.log('devjsPaths', devjsPaths());
  const {
    devjsPath,
    devjsDOMPath,
    devjsDOMClientPath,
    needsDevjsDOM,
    usingModules,
  } = devjsPaths();

  if (usingModules) {
    return loadModules([
      ['Devjs', devjsPath],
      ['DevjsDOM', devjsDOMPath],
      ['DevjsDOMClient', devjsDOMClientPath],
    ]);
  } else {
    let request = loadScript(devjsPath, usingModules);

    if (needsDevjsDOM) {
      request = request.then(() => loadScript(devjsDOMPath, usingModules));
    } else {
      // Aliasing Devjs to DevjsDOM for compatibility.
      request = request.then(() => {
        window.DevjsDOM = window.Devjs;
      });
    }
    return request;
  }
}
