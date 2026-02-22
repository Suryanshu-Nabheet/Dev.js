// @flow @gating
import {Stringify} from 'shared-runtime';
import * as Devjs from 'devjs';

component Foo(ref: Devjs.RefSetter<Controls>) {
  return <Stringify ref={ref} />;
}

export const FIXTURE_ENTRYPOINT = {
  fn: eval('(...args) => Devjs.createElement(Foo, args)'),
  params: [{ref: Devjs.createRef()}],
};
