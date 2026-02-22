import FixtureSet from '../../FixtureSet';
import TestCase from '../../TestCase';

const Devjs = window.Devjs;
const DevjsDOM = window.DevjsDOM;

const supportsCustomElements = typeof customElements !== 'undefined';

class HelloWorld extends Devjs.Component {
  render() {
    return <h1>Hello, world!</h1>;
  }
}

if (supportsCustomElements) {
  // Babel breaks web components.
  // https://github.com/w3c/webcomponents/issues/587
  // eslint-disable-next-line no-new-func
  const MyElement = new Function(
    'Devjs',
    'DevjsDOM',
    'HelloWorld',
    `
    return class MyElement extends HTMLElement {
      constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode:'open' });
        DevjsDOM.render(Devjs.createElement(HelloWorld), shadowRoot);
      }
    }`
  )(Devjs, DevjsDOM, HelloWorld);
  customElements.define('my-element', MyElement);
}

export default class ButtonTestCases extends Devjs.Component {
  render() {
    return (
      <FixtureSet
        title="Custom Elements"
        description="Support for Custom Element DOM standards.">
        <TestCase title="Rendering into shadow root">
          <TestCase.ExpectedResult>
            You should see "Hello, World" printed below.{' '}
          </TestCase.ExpectedResult>
          {supportsCustomElements ? (
            <my-element />
          ) : (
            <div>This browser does not support custom elements.</div>
          )}
        </TestCase>
      </FixtureSet>
    );
  }
}
