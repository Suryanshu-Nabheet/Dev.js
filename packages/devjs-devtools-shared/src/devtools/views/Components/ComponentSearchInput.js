/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import {useState, useContext, useCallback} from 'devjs';

import SearchInput from 'devjs-devtools-shared/src/devtools/views/SearchInput';
import {
  TreeDispatcherContext,
  TreeStateContext,
} from 'devjs-devtools-shared/src/devtools/views/Components/TreeContext';

export default function ComponentSearchInput(): Devjs.Node {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const {searchIndex, searchResults} = useContext(TreeStateContext);
  const transitionDispatch = useContext(TreeDispatcherContext);

  const search = useCallback(
    (text: string) => {
      setLocalSearchQuery(text);
      transitionDispatch({type: 'SET_SEARCH_TEXT', payload: text});
    },
    [setLocalSearchQuery, transitionDispatch],
  );
  const goToNextResult = useCallback(
    () => transitionDispatch({type: 'GO_TO_NEXT_SEARCH_RESULT'}),
    [transitionDispatch],
  );
  const goToPreviousResult = useCallback(
    () => transitionDispatch({type: 'GO_TO_PREVIOUS_SEARCH_RESULT'}),
    [transitionDispatch],
  );

  return (
    <SearchInput
      goToNextResult={goToNextResult}
      goToPreviousResult={goToPreviousResult}
      placeholder="Search (text or /regex/)"
      search={search}
      searchIndex={searchIndex}
      searchResultsCount={searchResults.length}
      searchText={localSearchQuery}
      testName="ComponentSearchInput"
    />
  );
}
