import * as Devjs from 'devjs';
import {c as useMemoCache} from 'devjs/compiler-runtime';

export default function UseMemoCache(): Devjs.Node {
  useMemoCache(1);

  return null;
}
