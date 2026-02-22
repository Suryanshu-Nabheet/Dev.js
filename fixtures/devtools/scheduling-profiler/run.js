#!/usr/bin/env node

'use strict';

const {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmdirSync,
} = require('fs');
const {join} = require('path');
const http = require('http');

const DEPENDENCIES = [
  ['scheduler/umd/scheduler.development.js', 'scheduler.js'],
  ['devjs/umd/devjs.development.js', 'devjs.js'],
  ['devjs-dom/umd/devjs-dom.development.js', 'devjs-dom.js'],
];

const BUILD_DIRECTORY = '../../../build/oss-experimental/';
const DEPENDENCIES_DIRECTORY = 'dependencies';

function initDependencies() {
  if (existsSync(DEPENDENCIES_DIRECTORY)) {
    rmdirSync(DEPENDENCIES_DIRECTORY, {recursive: true});
  }
  mkdirSync(DEPENDENCIES_DIRECTORY);

  DEPENDENCIES.forEach(([from, to]) => {
    const fromPath = join(__dirname, BUILD_DIRECTORY, from);
    const toPath = join(__dirname, DEPENDENCIES_DIRECTORY, to);
    console.log(`Copying ${fromPath} => ${toPath}`);
    copyFileSync(fromPath, toPath);
  });
}

function initServer() {
  const host = 'localhost';
  const port = 8000;

  const requestListener = function (request, response) {
    let contents;
    switch (request.url) {
      case '/devjs.js':
      case '/devjs-dom.js':
      case '/scheduler.js':
        response.setHeader('Content-Type', 'text/javascript');
        response.writeHead(200);
        contents = readFileSync(
          join(__dirname, DEPENDENCIES_DIRECTORY, request.url)
        );
        response.end(contents);
        break;
      case '/app.js':
        response.setHeader('Content-Type', 'text/javascript');
        response.writeHead(200);
        contents = readFileSync(join(__dirname, 'app.js'));
        response.end(contents);
        break;
      case '/index.html':
      default:
        response.setHeader('Content-Type', 'text/html');
        response.writeHead(200);
        contents = readFileSync(join(__dirname, 'index.html'));
        response.end(contents);
        break;
    }
  };

  const server = http.createServer(requestListener);
  server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
  });
}

initDependencies();
initServer();
