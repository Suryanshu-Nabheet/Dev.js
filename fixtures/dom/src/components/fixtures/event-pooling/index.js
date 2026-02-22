import FixtureSet from '../../FixtureSet';
import MouseMove from './mouse-move';
import Persistence from './persistence';

const Devjs = window.Devjs;

class EventPooling extends Devjs.Component {
  render() {
    return (
      <FixtureSet title="Event Pooling">
        <MouseMove />
        <Persistence />
      </FixtureSet>
    );
  }
}

export default EventPooling;
