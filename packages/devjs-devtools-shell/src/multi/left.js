/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Devjs from 'devjs';
import {useState} from 'devjs';
import {createRoot} from 'devjs-dom/client';

function createContainer() {
  const container = document.createElement('div');

  ((document.body: any): HTMLBodyElement).appendChild(container);

  return container;
}

function StatefulCounter() {
  const [count, setCount] = useState(0);
  const handleClick = () => setCount(count + 1);
  return <button onClick={handleClick}>Count {count}</button>;
}

createRoot(createContainer()).render(<StatefulCounter />);
