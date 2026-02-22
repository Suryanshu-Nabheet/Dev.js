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
import ButtonLabel from 'devjs-devtools-shared/src/devtools/views/ButtonLabel';

import type {SourceSelection} from './EditorPane';
import type {DevjsFunctionLocation} from 'shared/DevjsTypes';

import {checkConditions} from './utils';

type Props = {
  editorURL: string,
  source: ?SourceSelection,
  className?: string,
};

function ActualOpenInEditorButton({
  editorURL,
  source,
  className,
}: Props): Devjs.Node {
  let disable;
  if (source == null) {
    disable = true;
  } else {
    const staleLocation: DevjsFunctionLocation = [
      '',
      source.url,
      // This is not live but we just use any line/column to validate whether this can be opened.
      // We'll call checkConditions again when we click it to get the latest line number.
      source.selectionRef.line,
      source.selectionRef.column,
    ];
    disable = checkConditions(editorURL, staleLocation).shouldDisableButton;
  }
  return (
    <Button
      disabled={disable}
      className={className}
      onClick={() => {
        if (source == null) {
          return;
        }
        const latestLocation: DevjsFunctionLocation = [
          '',
          source.url,
          // These might have changed since we last read it.
          source.selectionRef.line,
          source.selectionRef.column,
        ];
        const {url, shouldDisableButton} = checkConditions(
          editorURL,
          latestLocation,
        );
        if (!shouldDisableButton) {
          window.open(url);
        }
      }}>
      <ButtonIcon type="editor" />
      <ButtonLabel>Open in editor</ButtonLabel>
    </Button>
  );
}

function OpenInEditorButton({editorURL, source, className}: Props): Devjs.Node {
  return (
    <Devjs.Suspense
      fallback={
        <Button disabled={true} className={className}>
          <ButtonIcon type="editor" />
          <ButtonLabel>Loading source maps...</ButtonLabel>
        </Button>
      }>
      <ActualOpenInEditorButton
        editorURL={editorURL}
        source={source}
        className={className}
      />
    </Devjs.Suspense>
  );
}

export default OpenInEditorButton;
