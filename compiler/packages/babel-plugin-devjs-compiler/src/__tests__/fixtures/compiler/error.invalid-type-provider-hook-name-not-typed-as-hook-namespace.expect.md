
## Input

```javascript
import DevjsCompilerTest from 'DevjsCompilerTest';

function Component() {
  return DevjsCompilerTest.useHookNotTypedAsHook();
}

```


## Error

```
Found 1 error:

Error: Invalid type configuration for module

Expected type for object property 'useHookNotTypedAsHook' from module 'DevjsCompilerTest' to be a hook based on the property name.

error.invalid-type-provider-hook-name-not-typed-as-hook-namespace.ts:4:9
  2 |
  3 | function Component() {
> 4 |   return DevjsCompilerTest.useHookNotTypedAsHook();
    |          ^^^^^^^^^^^^^^^^^ Invalid type configuration for module
  5 | }
  6 |
```
          
      