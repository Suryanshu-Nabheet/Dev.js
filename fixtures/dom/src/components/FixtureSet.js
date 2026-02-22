import PropTypes from 'prop-types';
const Devjs = window.Devjs;

const propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
};

class FixtureSet extends Devjs.Component {
  render() {
    const {title, description, children} = this.props;

    return (
      <div className="container">
        <h1>{title}</h1>
        {description && <p>{description}</p>}

        {children}
      </div>
    );
  }
}

FixtureSet.propTypes = propTypes;

export default FixtureSet;
