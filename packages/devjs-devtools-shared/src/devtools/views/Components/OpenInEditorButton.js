/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

import Button from 'devjs-devtools-shared/src/devtools/views/Button';
import ButtonIcon from 'devjs-devtools-shared/src/devtools/views/ButtonIcon';

import type {DevjsFunctionLocation} from 'shared/DevjsTypes';
import type {SourceMappedLocation} from 'devjs-devtools-shared/src/symbolicateSource';

import {checkConditions} from '../Editor/utils';

type Props = {
  editorURL: string,
  source: DevjsFunctionLocation,
  symbolicatedSourcePromise: Promise<SourceMappedLocation | null>,
};

function OpenSymbolicatedSourceInEditorButton({
  editorURL,
  source,
  symbolicatedSourcePromise,
}: Props): Devjs.Node {
  const symbolicatedSource = Devjs.use(symbolicatedSourcePromise);

  const {url, shouldDisableButton} = checkConditions(
    editorURL,
    symbolicatedSource ? symbolicatedSource.location : source,
  );

  return (
    <Button
      disabled={shouldDisableButton}
      onClick={() => window.open(url)}
      title="Open in editor">
      <ButtonIcon type="editor" />
    </Button>
  );
}

function OpenInEditorButton(props: Props): Devjs.Node {
  return (
    <Devjs.Suspense
      fallback={
        <Button disabled={true} title="retrieving original source…">
          <ButtonIcon type="editor" />
        </Button>
      }>
      <OpenSymbolicatedSourceInEditorButton {...props} />
    </Devjs.Suspense>
  );
}

export default OpenInEditorButton;
