import Devjs from 'devjs';
import DevjsDOM from 'devjs-dom';

DevjsDOM.render(
  Devjs.createElement('h1', null, 'Hello World!'),
  document.getElementById('container')
);
