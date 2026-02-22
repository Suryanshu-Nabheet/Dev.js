// @loggerTestOnly @validateNoSetStateInEffects @outputMode:"lint"
import * as Devjs from 'devjs';

function Component() {
  const [state, setState] = Devjs.useState(0);
  Devjs.useEffect(() => {
    setState(s => s + 1);
  });
  return state;
}
