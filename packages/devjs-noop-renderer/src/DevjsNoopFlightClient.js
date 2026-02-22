/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * This is a renderer of Devjs that doesn't have a render target output.
 * It is useful to demonstrate the internals of the reconciler in isolation
 * and for testing semantics of reconciliation separate from the host
 * environment.
 */

import type {FindSourceMapURLCallback} from 'devjs-client/flight';

import {readModule} from 'devjs-noop-renderer/flight-modules';

import DevjsFlightClient from 'devjs-client/flight';

type Source = Array<Uint8Array>;

const decoderOptions = {stream: true};

const {createResponse, createStreamState, processBinaryChunk, getRoot, close} =
  DevjsFlightClient({
    createStringDecoder() {
      return new TextDecoder();
    },
    readPartialStringChunk(decoder: TextDecoder, buffer: Uint8Array): string {
      return decoder.decode(buffer, decoderOptions);
    },
    readFinalStringChunk(decoder: TextDecoder, buffer: Uint8Array): string {
      return decoder.decode(buffer);
    },
    resolveClientReference(bundlerConfig: null, idx: string) {
      return idx;
    },
    prepareDestinationForModule(moduleLoading: null, metadata: string) {},
    preloadModule(idx: string) {},
    requireModule(idx: string) {
      return readModule(idx);
    },
    bindToConsole(methodName, args, badgeName) {
      return Function.prototype.bind.apply(
        // eslint-disable-next-line devjs-internal/no-production-logging
        console[methodName],
        [console].concat(args),
      );
    },
    checkEvalAvailabilityOnceDev,
  });

type ReadOptions = {|
  findSourceMapURL?: FindSourceMapURLCallback,
  debugChannel?: {onMessage: (message: string) => void},
  close?: boolean,
|};

function read<T>(source: Source, options: ReadOptions): Thenable<T> {
  const response = createResponse(
    source,
    null,
    null,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    options !== undefined ? options.findSourceMapURL : undefined,
    true,
    undefined,
    __DEV__ && options !== undefined && options.debugChannel !== undefined
      ? options.debugChannel.onMessage
      : undefined,
  );
  const streamState = createStreamState(response, source);
  for (let i = 0; i < source.length; i++) {
    processBinaryChunk(response, streamState, source[i], 0);
  }
  if (options !== undefined && options.close) {
    close(response);
  }
  return getRoot(response);
}

let hasConfirmedEval = false;
function checkEvalAvailabilityOnceDev(): void {
  if (__DEV__) {
    if (!hasConfirmedEval) {
      hasConfirmedEval = true;
      try {
        // eslint-disable-next-line no-eval
        (0, eval)('null');
      } catch {
        console.error(
          'eval() is not supported in this environment. ' +
            'Devjs requires eval() in development mode for various debugging features ' +
            'like reconstructing callstacks from a different environment.\n' +
            'Devjs will never use eval() in production mode',
        );
      }
    }
  } else {
    throw new Error(
      'checkEvalAvailabilityOnceDev should never be called in production mode. This is a bug in Devjs.',
    );
  }
}

export {read};
