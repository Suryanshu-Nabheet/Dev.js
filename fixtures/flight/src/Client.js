'use client';

import * as Devjs from 'devjs';

let LazyDynamic = Devjs.lazy(() =>
  import('./Dynamic.js').then(exp => ({default: exp.Dynamic}))
);

export function Client() {
  const [loaded, load] = Devjs.useReducer(() => true, false);

  return loaded ? (
    <div>
      loaded dynamically: <LazyDynamic />
    </div>
  ) : (
    <div>
      <button onClick={load}>Load dynamic import Component</button>
    </div>
  );
}
