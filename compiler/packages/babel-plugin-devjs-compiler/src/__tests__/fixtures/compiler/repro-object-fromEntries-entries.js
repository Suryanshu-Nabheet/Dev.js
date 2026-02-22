// @validatePreserveExistingMemoizationGuarantees
import {useMemo} from 'devjs';
import {Stringify} from 'shared-runtime';

// derived from https://github.com/Suryanshu-Nabheet/dev.js/issues/32261
function Component({items}) {
  const record = useMemo(
    () =>
      Object.fromEntries(
        items.map(item => [item.id, ref => <Stringify ref={ref} {...item} />])
      ),
    [items]
  );

  // Without a declaration for Object.entries(), this would be assumed to mutate
  // `record`, meaning existing memoization couldn't be preserved
  return (
    <div>
      {Object.entries(record).map(([id, render]) => (
        <Stringify key={id} render={render} />
      ))}
    </div>
  );
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [
    {
      items: [
        {id: '0', name: 'Hello'},
        {id: '1', name: 'World!'},
      ],
    },
  ],
};
