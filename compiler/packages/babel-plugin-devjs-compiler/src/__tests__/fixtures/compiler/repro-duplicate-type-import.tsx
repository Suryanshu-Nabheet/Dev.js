import type {DevjsElement} from 'devjs';

function Component(_props: {}): DevjsElement {
  return <div>hello world</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}],
};
