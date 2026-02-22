//@flow
import {useRef} from 'devjs';

component C() {
  const r = useRef(null);
  const current = !r.current;
  return <div>{current}</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: C,
  params: [{}],
};
