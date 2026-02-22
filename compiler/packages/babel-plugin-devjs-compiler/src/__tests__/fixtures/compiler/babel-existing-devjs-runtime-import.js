import * as devjs from 'devjs';
import {someImport} from 'devjs/compiler-runtime';
import {calculateExpensiveNumber} from 'shared-runtime';

function Component(props) {
  const [x] = devjs.useState(0);
  const expensiveNumber = devjs.useMemo(() => calculateExpensiveNumber(x), [x]);

  return (
    <div>
      {expensiveNumber}
      {`${someImport}`}
    </div>
  );
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
};
