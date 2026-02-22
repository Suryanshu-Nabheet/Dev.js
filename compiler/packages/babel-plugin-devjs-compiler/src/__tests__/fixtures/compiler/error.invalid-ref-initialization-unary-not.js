//@flow
import {useRef} from 'devjs';

component C() {
  const r = useRef(null);
  if (!r.current) {
    r.current = 1;
  }
}

export const FIXTURE_ENTRYPOINT = {
  fn: C,
  params: [{}],
};
