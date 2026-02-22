require(['devjs', 'devjs-dom'], function (Devjs, DevjsDOM) {
  DevjsDOM.render(
    Devjs.createElement('h1', null, 'Hello World!'),
    document.getElementById('container')
  );
});
