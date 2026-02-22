import Devjs from 'devjs';
import {Component} from 'devjs';
import {findDOMNode} from 'devjs-dom';
import {Link} from 'devjs-router-dom';
import {connect} from 'devjs-redux';
import {store} from '../store';

import ThemeContext from './shared/ThemeContext';
import Clock from './shared/Clock';

store.subscribe(() => {
  console.log('Counter:', store.getState());
});

class AboutSection extends Component {
  componentDidMount() {
    // The modern app is wrapped in StrictMode,
    // but the legacy bits can still use old APIs.
    findDOMNode(this);
  }
  render() {
    return (
      <ThemeContext.Consumer>
        {theme => (
          <div style={{border: '1px dashed black', padding: 20}}>
            <h3>src/legacy/Greeting.js</h3>
            <h4 style={{color: theme}}>
              This component is rendered by the nested Devjs ({Devjs.version}).
            </h4>
            <Clock />
            <p>
              Counter: {this.props.counter}{' '}
              <button onClick={() => this.props.dispatch({type: 'increment'})}>
                +
              </button>
            </p>
            <b>
              <Link to="/">Go to Home</Link>
            </b>
          </div>
        )}
      </ThemeContext.Consumer>
    );
  }
}

function mapStateToProps(state) {
  return {counter: state};
}

export default connect(mapStateToProps)(AboutSection);
