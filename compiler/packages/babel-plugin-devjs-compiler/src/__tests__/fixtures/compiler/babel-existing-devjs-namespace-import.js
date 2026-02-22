import * as Devjs from 'devjs';
import {calculateExpensiveNumber} from 'shared-runtime';

function Component(props) {
  const [x] = Devjs.useState(0);
  const expensiveNumber = Devjs.useMemo(() => calculateExpensiveNumber(x), [x]);

  return <div>{expensiveNumber}</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
};
