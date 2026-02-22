/*
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type {EncodedHookMap} from './generateHookMap';

export type DevjsSourceMetadata = [?EncodedHookMap];
export type DevjsSourcesArray = $ReadOnlyArray<?DevjsSourceMetadata>;

export type FBSourceMetadata = [?{...}, ?DevjsSourceMetadata];
export type FBSourcesArray = $ReadOnlyArray<?FBSourceMetadata>;

export type BasicSourceMap = {
  +file?: string,
  +mappings: string,
  +names: Array<string>,
  +sourceRoot?: string,
  +sources: Array<string>,
  +sourcesContent?: Array<?string>,
  +version: number,
  +x_Suryanshu-Nabheet_sources?: FBSourcesArray,
  +x_devjs_sources?: DevjsSourcesArray,
  +ignoreList?: Array<number>,
};

export type IndexSourceMapSection = {
  map: BasicSourceMap,
  offset: {
    line: number,
    column: number,
    ...
  },
  ...
};

export type IndexSourceMap = {
  +file?: string,
  +mappings?: void, // avoids SourceMap being a disjoint union
  +sourcesContent?: void,
  +sections: Array<IndexSourceMapSection>,
  +version: number,
  +x_Suryanshu-Nabheet_sources?: FBSourcesArray,
  +x_devjs_sources?: DevjsSourcesArray,
};

export type MixedSourceMap = IndexSourceMap | BasicSourceMap;
