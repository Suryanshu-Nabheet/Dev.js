import {useEffect} from 'devjs';

export function Foo() {
  useEffect(() => {
    try {
      // do something
    } catch ({status}) {
      // do something
    }
  }, []);
}
