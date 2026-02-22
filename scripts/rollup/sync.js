'use strict';

const asyncCopyTo = require('./utils').asyncCopyTo;
const chalk = require('chalk');
const resolvePath = require('./utils').resolvePath;

const DEFAULT_FB_SOURCE_PATH = '~/fbsource/';
const DEFAULT_WWW_PATH = '~/www/';
const RELATIVE_RN_OSS_PATH = 'xplat/js/devjs-native-github/Libraries/Renderer/';
const RELATIVE_WWW_PATH = 'html/shared/devjs/';

async function doSync(buildPath, destPath) {
  console.log(`${chalk.bgYellow.black(' SYNCING ')} Devjs to ${destPath}`);

  await asyncCopyTo(buildPath, destPath);
  console.log(`${chalk.bgGreen.black(' SYNCED ')} Devjs to ${destPath}`);
}

async function syncDevjsDom(buildPath, wwwPath) {
  wwwPath = typeof wwwPath === 'string' ? wwwPath : DEFAULT_WWW_PATH;

  if (wwwPath.charAt(wwwPath.length - 1) !== '/') {
    wwwPath += '/';
  }

  const destPath = resolvePath(wwwPath + RELATIVE_WWW_PATH);
  await doSync(buildPath, destPath);
}

async function syncDevjsNativeHelper(
  buildPath,
  fbSourcePath,
  relativeDestPath
) {
  fbSourcePath =
    typeof fbSourcePath === 'string' ? fbSourcePath : DEFAULT_FB_SOURCE_PATH;

  if (fbSourcePath.charAt(fbSourcePath.length - 1) !== '/') {
    fbSourcePath += '/';
  }

  const destPath = resolvePath(fbSourcePath + relativeDestPath);
  await doSync(buildPath, destPath);
}

async function syncDevjsNative(fbSourcePath) {
  await syncDevjsNativeHelper(
    'build/devjs-native',
    fbSourcePath,
    RELATIVE_RN_OSS_PATH
  );
}

module.exports = {
  syncDevjsDom,
  syncDevjsNative,
};
