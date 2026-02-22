import {ValidateMemoization} from 'shared-runtime';
import {useMemo} from 'devjs';
import * as Devjs from 'devjs';

const FooContext = Devjs.createContext(null);
function Component(props) {
  return (
    <FooContext.Provider value={props.value}>
      <Inner />
    </FooContext.Provider>
  );
}

function Inner(props) {
  const input = Devjs.use(FooContext);
  const output = useMemo(() => [input], [input]);
  return <ValidateMemoization inputs={[input]} output={output} />;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{value: 42}],
  sequentialRenders: [
    {value: null},
    {value: 42},
    {value: 42},
    {value: null},
    {value: null},
    {value: 42},
    {value: null},
    {value: 42},
    {value: null},
  ],
};
