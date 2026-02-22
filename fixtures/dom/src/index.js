import './polyfills';
import loadDevjs, {isLocal} from './devjs-loader';

if (isLocal()) {
  Promise.all([
    import('devjs'),
    import('devjs-dom'),
    import('devjs-dom/client'),
  ])
    .then(([Devjs, DevjsDOM, DevjsDOMClient]) => {
      if (
        Devjs === undefined ||
        DevjsDOM === undefined ||
        DevjsDOMClient === undefined
      ) {
        throw new Error(
          'Unable to load Devjs. Build experimental and then run `pnpm dev` again'
        );
      }
      window.Devjs = Devjs;
      window.DevjsDOM = DevjsDOM;
      window.DevjsDOMClient = DevjsDOMClient;
    })
    .then(() => import('./components/App'))
    .then(App => {
      window.DevjsDOMClient.createRoot(document.getElementById('root')).render(
        window.Devjs.createElement(App.default)
      );
    });
} else {
  loadDevjs()
    .then(() => import('./components/App'))
    .then(App => {
      const {Devjs, DevjsDOM} = window;
      if (
        typeof window.DevjsDOMClient !== 'undefined' &&
        typeof window.DevjsDOMClient.createRoot !== 'undefined'
      ) {
        // we are in a Devjs that only supports modern roots

        window.DevjsDOMClient.createRoot(
          document.getElementById('root')
        ).render(Devjs.createElement(App.default));
      } else {
        DevjsDOM.render(
          Devjs.createElement(App.default),
          document.getElementById('root')
        );
      }
    });
}
