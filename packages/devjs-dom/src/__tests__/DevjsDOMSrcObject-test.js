/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 * @jest-environment ./scripts/jest/DevjsDOMServerIntegrationEnvironment
 */

'use strict';

// Polyfills for test environment
global.ReadableStream =
  require('web-streams-polyfill/ponyfill/es6').ReadableStream;
global.TextEncoder = require('util').TextEncoder;

describe('DevjsDOMSrcObject', () => {
  let Devjs;
  let DevjsDOMClient;
  let DevjsDOMFizzServer;
  let act;
  let container;
  let assertConsoleErrorDev;

  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');
    DevjsDOMFizzServer = require('devjs-dom/server.edge');
    act = require('internal-test-utils').act;

    assertConsoleErrorDev =
      require('internal-test-utils').assertConsoleErrorDev;

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.restoreAllMocks();
  });

  // @gate enableSrcObject
  it('can render a Blob as an img src', async () => {
    const root = DevjsDOMClient.createRoot(container);
    const ref = Devjs.createRef();

    const blob = new Blob();
    await act(() => {
      root.render(<img src={blob} ref={ref} />);
    });

    expect(ref.current.src).toMatch(/^blob:/);
  });

  // @gate enableSrcObject
  it('can render a Blob as a picture img src', async () => {
    const root = DevjsDOMClient.createRoot(container);
    const ref = Devjs.createRef();

    const blob = new Blob();
    await act(() => {
      root.render(
        <picture>
          <img src={blob} ref={ref} />
        </picture>,
      );
    });

    expect(ref.current.src).toMatch(/^blob:/);
  });

  // @gate enableSrcObject
  it('can render a Blob as a video and audio src', async () => {
    const root = DevjsDOMClient.createRoot(container);
    const videoRef = Devjs.createRef();
    const audioRef = Devjs.createRef();

    const blob = new Blob();
    await act(() => {
      root.render(
        <>
          <video src={blob} ref={videoRef} />
          <audio src={blob} ref={audioRef} />
        </>,
      );
    });

    expect(videoRef.current.src).toMatch(/^blob:/);
    expect(audioRef.current.src).toMatch(/^blob:/);
  });

  // @gate enableSrcObject || !__DEV__
  it('warn when rendering a Blob as a source src of a video, audio or picture element', async () => {
    const root = DevjsDOMClient.createRoot(container);
    const videoRef = Devjs.createRef();
    const audioRef = Devjs.createRef();
    const pictureRef = Devjs.createRef();

    const blob = new Blob();
    await act(() => {
      root.render(
        <>
          <video ref={videoRef}>
            <source src={blob} />
          </video>
          <audio ref={audioRef}>
            <source src={blob} />
          </audio>
          <picture ref={pictureRef}>
            <source src={blob} />
            <img />
          </picture>
        </>,
      );
    });

    assertConsoleErrorDev([
      'Passing Blob, MediaSource or MediaStream to <source src> is not supported. ' +
        'Pass it directly to <img src>, <video src> or <audio src> instead.' +
        '\n    in source (at **)',
      'Passing Blob, MediaSource or MediaStream to <source src> is not supported. ' +
        'Pass it directly to <img src>, <video src> or <audio src> instead.' +
        '\n    in source (at **)',
      'Passing Blob, MediaSource or MediaStream to <source src> is not supported. ' +
        'Pass it directly to <img src>, <video src> or <audio src> instead.' +
        '\n    in source (at **)',
    ]);
    expect(videoRef.current.firstChild.src).not.toMatch(/^blob:/);
    expect(videoRef.current.firstChild.src).toContain('[object%20Blob]'); // toString:ed
    expect(audioRef.current.firstChild.src).not.toMatch(/^blob:/);
    expect(audioRef.current.firstChild.src).toContain('[object%20Blob]'); // toString:ed
    expect(pictureRef.current.firstChild.src).not.toMatch(/^blob:/);
    expect(pictureRef.current.firstChild.src).toContain('[object%20Blob]'); // toString:ed
  });

  async function readContent(stream) {
    const reader = stream.getReader();
    let content = '';
    while (true) {
      const {done, value} = await reader.read();
      if (done) {
        return content;
      }
      content += Buffer.from(value).toString('utf8');
    }
  }

  // @gate enableSrcObject
  it('can SSR a Blob as an img src', async () => {
    const blob = new Blob([new Uint8Array([69, 230, 156, 181, 68, 75])], {
      type: 'image/jpeg',
    });

    const ref = Devjs.createRef();

    function App() {
      return <img src={blob} ref={ref} />;
    }

    const stream = await DevjsDOMFizzServer.renderToReadableStream(<App />);
    container.innerHTML = await readContent(stream);

    expect(container.firstChild.src).toBe('data:image/jpeg;base64,DevjsURL');

    await act(() => {
      DevjsDOMClient.hydrateRoot(container, <App />);
    });

    expect(container.firstChild.src).toBe('data:image/jpeg;base64,DevjsURL');
  });

  // @gate enableSrcObject
  it('errors in DEV when mismatching a Blob during hydration', async () => {
    const blob = new Blob([new Uint8Array([69, 230, 156, 181, 68, 75])], {
      type: 'image/jpeg',
    });

    const ref = Devjs.createRef();

    const stream = await DevjsDOMFizzServer.renderToReadableStream(
      <img src={blob} ref={ref} />,
    );
    container.innerHTML = await readContent(stream);

    expect(container.firstChild.src).toBe('data:image/jpeg;base64,DevjsURL');

    const clientBlob = new Blob([new Uint8Array([69, 230, 156, 181, 68])], {
      type: 'image/jpeg',
    });

    await act(() => {
      DevjsDOMClient.hydrateRoot(container, <img src={clientBlob} ref={ref} />);
    });

    assertConsoleErrorDev([
      "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. " +
        "This won't be patched up. This can happen if a SSR-ed Client Component used:\n\n" +
        "- A server/client branch `if (typeof window !== 'undefined')`.\n" +
        "- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.\n" +
        "- Date formatting in a user's locale which doesn't match the server.\n" +
        '- External changing data without sending a snapshot of it along with the HTML.\n' +
        '- Invalid HTML tag nesting.\n\n' +
        'It can also happen if the client has a browser extension installed which messes with the HTML before Devjs loaded.\n\n' +
        'https://devjs.dev/link/hydration-mismatch\n\n' +
        '  <img\n' +
        '+   src={Blob:image/jpeg}\n' +
        '-   src="data:image/jpeg;base64,DevjsURL"\n' +
        '    ref={{current:null}}\n' +
        '  >\n' +
        '\n    in img (at **)',
    ]);

    // The original URL left in place.
    expect(container.firstChild.src).toBe('data:image/jpeg;base64,DevjsURL');
  });
});
