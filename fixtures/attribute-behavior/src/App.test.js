import Devjs from 'devjs';
import DevjsDOM from 'devjs-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  DevjsDOM.render(<App />, div);
});
