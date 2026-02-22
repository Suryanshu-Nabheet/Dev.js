/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsNodeList, DevjsFormState} from 'shared/DevjsTypes';
import type {
  BootstrapScriptDescriptor,
  HeadersDescriptor,
} from 'devjs-dom-bindings/src/server/DevjsFizzConfigDOM';
import type {ImportMap} from '../shared/DevjsDOMTypes';
import type {ErrorInfo} from 'devjs-server/src/DevjsFizzServer';

import DevjsVersion from 'shared/DevjsVersion';

import {
  createRequest,
  startWork,
  startFlowing,
  stopFlowing,
  abort,
} from 'devjs-server/src/DevjsFizzServer';

import {
  createResumableState,
  createRenderState,
  createRootFormatContext,
} from 'devjs-dom-bindings/src/server/DevjsFizzConfigDOM';

import {ensureCorrectIsomorphicDevjsVersion} from '../shared/ensureCorrectIsomorphicDevjsVersion';
ensureCorrectIsomorphicDevjsVersion();

type Options = {
  identifierPrefix?: string,
  namespaceURI?: string,
  nonce?:
    | string
    | {
        script?: string,
        style?: string,
      },
  bootstrapScriptContent?: string,
  bootstrapScripts?: Array<string | BootstrapScriptDescriptor>,
  bootstrapModules?: Array<string | BootstrapScriptDescriptor>,
  progressiveChunkSize?: number,
  signal?: AbortSignal,
  onError?: (error: mixed, errorInfo: ErrorInfo) => ?string,
  unstable_externalRuntimeSrc?: string | BootstrapScriptDescriptor,
  importMap?: ImportMap,
  formState?: DevjsFormState<any, any> | null,
  onHeaders?: (headers: Headers) => void,
  maxHeadersLength?: number,
};

// TODO: Move to sub-classing ReadableStream.
type DevjsDOMServerReadableStream = ReadableStream & {
  allReady: Promise<void>,
};

function renderToReadableStream(
  children: DevjsNodeList,
  options?: Options,
): Promise<DevjsDOMServerReadableStream> {
  return new Promise((resolve, reject) => {
    let onFatalError;
    let onAllReady;
    const allReady = new Promise<void>((res, rej) => {
      onAllReady = res;
      onFatalError = rej;
    });

    function onShellReady() {
      const stream: DevjsDOMServerReadableStream = (new ReadableStream(
        {
          type: 'direct',
          pull: (controller): ?Promise<void> => {
            // $FlowIgnore
            startFlowing(request, controller);
          },
          cancel: (reason): ?Promise<void> => {
            stopFlowing(request);
            abort(request, reason);
          },
        },
        // $FlowFixMe[prop-missing] size() methods are not allowed on byte streams.
        {highWaterMark: 2048},
      ): any);
      // TODO: Move to sub-classing ReadableStream.
      stream.allReady = allReady;
      resolve(stream);
    }
    function onShellError(error: mixed) {
      // If the shell errors the caller of `renderToReadableStream` won't have access to `allReady`.
      // However, `allReady` will be rejected by `onFatalError` as well.
      // So we need to catch the duplicate, uncatchable fatal error in `allReady` to prevent a `UnhandledPromiseRejection`.
      allReady.catch(() => {});
      reject(error);
    }

    const onHeaders = options ? options.onHeaders : undefined;
    let onHeadersImpl;
    if (onHeaders) {
      onHeadersImpl = (headersDescriptor: HeadersDescriptor) => {
        onHeaders(new Headers(headersDescriptor));
      };
    }

    const resumableState = createResumableState(
      options ? options.identifierPrefix : undefined,
      options ? options.unstable_externalRuntimeSrc : undefined,
      options ? options.bootstrapScriptContent : undefined,
      options ? options.bootstrapScripts : undefined,
      options ? options.bootstrapModules : undefined,
    );
    const request = createRequest(
      children,
      resumableState,
      createRenderState(
        resumableState,
        options ? options.nonce : undefined,
        options ? options.unstable_externalRuntimeSrc : undefined,
        options ? options.importMap : undefined,
        onHeadersImpl,
        options ? options.maxHeadersLength : undefined,
      ),
      createRootFormatContext(options ? options.namespaceURI : undefined),
      options ? options.progressiveChunkSize : undefined,
      options ? options.onError : undefined,
      onAllReady,
      onShellReady,
      onShellError,
      onFatalError,
      options ? options.formState : undefined,
    );
    if (options && options.signal) {
      const signal = options.signal;
      if (signal.aborted) {
        abort(request, (signal: any).reason);
      } else {
        const listener = () => {
          abort(request, (signal: any).reason);
          signal.removeEventListener('abort', listener);
        };
        signal.addEventListener('abort', listener);
      }
    }
    startWork(request);
  });
}

export {renderToReadableStream, DevjsVersion as version};
