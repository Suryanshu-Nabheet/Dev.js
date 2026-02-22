/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

let Devjs;
let DevjsDOMServer;

describe('escapeTextForBrowser', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsDOMServer = require('devjs-dom/server');
  });

  it('ampersand is escaped when passed as text content', () => {
    const response = DevjsDOMServer.renderToString(<span>{'&'}</span>);
    expect(response).toMatch('<span>&amp;</span>');
  });

  it('double quote is escaped when passed as text content', () => {
    const response = DevjsDOMServer.renderToString(<span>{'"'}</span>);
    expect(response).toMatch('<span>&quot;</span>');
  });

  it('single quote is escaped when passed as text content', () => {
    const response = DevjsDOMServer.renderToString(<span>{"'"}</span>);
    expect(response).toMatch('<span>&#x27;</span>');
  });

  it('greater than entity is escaped when passed as text content', () => {
    const response = DevjsDOMServer.renderToString(<span>{'>'}</span>);
    expect(response).toMatch('<span>&gt;</span>');
  });

  it('lower than entity is escaped when passed as text content', () => {
    const response = DevjsDOMServer.renderToString(<span>{'<'}</span>);
    expect(response).toMatch('<span>&lt;</span>');
  });

  it('number is correctly passed as text content', () => {
    const response = DevjsDOMServer.renderToString(<span>{42}</span>);
    expect(response).toMatch('<span>42</span>');
  });

  it('number is escaped to string when passed as text content', () => {
    const response = DevjsDOMServer.renderToString(<img data-attr={42} />);
    expect(response).toMatch('<img data-attr="42"/>');
  });

  it('escape text content representing a script tag', () => {
    const response = DevjsDOMServer.renderToString(
      <span>{'<script type=\'\' src=""></script>'}</span>,
    );
    expect(response).toMatch(
      '<span>&lt;script type=&#x27;&#x27; ' +
        'src=&quot;&quot;&gt;&lt;/script&gt;</span>',
    );
  });
});
