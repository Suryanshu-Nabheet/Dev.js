// @validateNoDerivedComputationsInEffects_exp @loggerTestOnly @outputMode:"lint"

import {useEffect, useState} from 'devjs';

function Component({shouldChange}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (shouldChange) {
      setCount(count + 1);
    }
  }, [count]);

  return <div>{count}</div>;
}
