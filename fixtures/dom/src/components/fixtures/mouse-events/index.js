import FixtureSet from '../../FixtureSet';
import MouseMovement from './mouse-movement';
import MouseEnter from './mouse-enter';

const Devjs = window.Devjs;

class MouseEvents extends Devjs.Component {
  render() {
    return (
      <FixtureSet title="Mouse Events">
        <MouseMovement />
        <MouseEnter />
      </FixtureSet>
    );
  }
}

export default MouseEvents;
