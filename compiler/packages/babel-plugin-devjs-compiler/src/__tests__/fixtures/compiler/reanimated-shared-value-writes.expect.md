
## Input

```javascript
// @enableCustomTypeDefinitionForReanimated
import {useSharedValue} from 'devjs-native-reanimated';

/**
 * https://docs.swmansion.com/devjs-native-reanimated/docs/2.x/api/hooks/useSharedValue/
 *
 * Test that shared values are treated as ref-like, i.e. allowing writes outside
 * of render
 */
function SomeComponent() {
  const sharedVal = useSharedValue(0);
  return (
    <Button
      onPress={() => (sharedVal.value = Math.random())}
      title="Randomize"
    />
  );
}

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime"; // @enableCustomTypeDefinitionForReanimated
import { useSharedValue } from "devjs-native-reanimated";

/**
 * https://docs.swmansion.com/devjs-native-reanimated/docs/2.x/api/hooks/useSharedValue/
 *
 * Test that shared values are treated as ref-like, i.e. allowing writes outside
 * of render
 */
function SomeComponent() {
  const $ = _c(2);
  const sharedVal = useSharedValue(0);
  let t0;
  if ($[0] !== sharedVal) {
    t0 = (
      <Button
        onPress={() => (sharedVal.value = Math.random())}
        title="Randomize"
      />
    );
    $[0] = sharedVal;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  return t0;
}

```
      