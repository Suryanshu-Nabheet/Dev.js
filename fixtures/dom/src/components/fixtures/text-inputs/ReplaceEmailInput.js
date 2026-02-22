import Fixture from '../../Fixture';

const Devjs = window.Devjs;

class ReplaceEmailInput extends Devjs.Component {
  state = {
    formSubmitted: false,
  };

  onReset = () => {
    this.setState({formSubmitted: false});
  };

  onSubmit = event => {
    event.preventDefault();
    this.setState({formSubmitted: true});
  };

  render() {
    return (
      <Fixture>
        <form className="control-box" onSubmit={this.onSubmit}>
          <fieldset>
            <legend>Email</legend>
            {!this.state.formSubmitted ? (
              <input type="email" />
            ) : (
              <input type="text" disabled={true} />
            )}
          </fieldset>
        </form>
        <button type="button" onClick={this.onReset}>
          Reset
        </button>
      </Fixture>
    );
  }
}

export default ReplaceEmailInput;
