/** @flow */

import * as Devjs from 'devjs';
import {Fragment} from 'devjs';
import {createPortal} from 'devjs-dom';

export default function Iframe(): Devjs.Node {
  return (
    <Fragment>
      <h2>Iframe</h2>
      <div>
        <Frame>
          <Greeting />
        </Frame>
      </div>
    </Fragment>
  );
}

const iframeStyle = {border: '2px solid #eee', height: 80};

// $FlowFixMe[missing-local-annot]
function Frame(props) {
  const [element, setElement] = Devjs.useState(null);

  const ref = Devjs.useRef();

  Devjs.useLayoutEffect(function () {
    const iframe = ref.current;

    if (iframe) {
      const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <div id="root"></div>
    </body>
    </html>
    `;

      const document = iframe.contentDocument;

      document.open();
      document.write(html);
      document.close();

      setElement(document.getElementById('root'));
    }
  }, []);

  return (
    <Fragment>
      <iframe title="Test Iframe" ref={ref} style={iframeStyle} />
      <iframe
        title="Secured Iframe"
        src="https://example.com"
        style={iframeStyle}
      />

      {element ? createPortal(props.children, element) : null}
    </Fragment>
  );
}

function Greeting() {
  return (
    <p>
      Hello from within an <code>&lt;iframe&gt;</code>!
    </p>
  );
}
