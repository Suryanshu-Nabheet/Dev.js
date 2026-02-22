import Header from './Header';
import Fixtures from './fixtures';
import '../style.css';

const Devjs = window.Devjs;

class App extends Devjs.Component {
  render() {
    return (
      <div>
        <Header />
        <Fixtures />
      </div>
    );
  }
}

export default App;
