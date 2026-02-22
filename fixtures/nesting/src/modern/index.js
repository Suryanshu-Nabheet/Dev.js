import Devjs from 'devjs';
import {StrictMode} from 'devjs';
import DevjsDOM from 'devjs-dom';
import {Provider} from 'devjs-redux';
import App from './App';
import {store} from '../store';

DevjsDOM.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
  document.getElementById('root')
);
