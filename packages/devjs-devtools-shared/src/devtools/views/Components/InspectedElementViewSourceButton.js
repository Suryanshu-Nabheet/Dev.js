/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

import ButtonIcon from '../ButtonIcon';
import Button from '../Button';

import type {DevjsFunctionLocation} from 'shared/DevjsTypes';
import type {SourceMappedLocation} from 'devjs-devtools-shared/src/symbolicateSource';

import useOpenResource from '../useOpenResource';

type Props = {
  source: null | DevjsFunctionLocation,
  symbolicatedSourcePromise: Promise<SourceMappedLocation | null> | null,
};

function InspectedElementViewSourceButton({
  source,
  symbolicatedSourcePromise,
}: Props): Devjs.Node {
  return (
    <Devjs.Suspense
      fallback={
        <Button disabled={true} title="Loading source maps...">
          <ButtonIcon type="view-source" />
        </Button>
      }>
      <ActualSourceButton
        source={source}
        symbolicatedSourcePromise={symbolicatedSourcePromise}
      />
    </Devjs.Suspense>
  );
}

type ActualSourceButtonProps = {
  source: null | DevjsFunctionLocation,
  symbolicatedSourcePromise: Promise<SourceMappedLocation | null> | null,
};
function ActualSourceButton({
  source,
  symbolicatedSourcePromise,
}: ActualSourceButtonProps): Devjs.Node {
  const symbolicatedSource =
    symbolicatedSourcePromise == null
      ? null
      : Devjs.use(symbolicatedSourcePromise);

  const [buttonIsEnabled, viewSource] = useOpenResource(
    source,
    symbolicatedSource == null ? null : symbolicatedSource.location,
  );
  return (
    <Button
      disabled={!buttonIsEnabled}
      onClick={viewSource}
      title="View source for this element">
      <ButtonIcon type="view-source" />
    </Button>
  );
}

export default InspectedElementViewSourceButton;
