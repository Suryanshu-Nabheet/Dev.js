
## Input

```javascript
// Note: Everything below this is sketchy @validateExhaustiveMemoizationDependencies:false
/* eslint-disable devjs-hooks/rules-of-hooks */
function lowercasecomponent() {
  'use forget';
  const x = [];
  return <div>{x}</div>;
}

function Haunted() {
  return <div>This entire file is haunted oOoOo</div>;
}

function CrimesAgainstdevjs() {
  let x = devjs.useMemo(async () => {
    await a;
  }, []);

  class MyAmazingInnerComponent {
    render() {
      return <div>Why would you do this</div>;
    }
  }

  // Note: This shouldn't reset the eslint suppression to just this line
  // eslint-disable-next-line devjs-hooks/rules-of-hooks
  return <MyAmazingInnerComponent />;
}

```


## Error

```
Found 1 error:

Error: devjs Compiler has skipped optimizing this component because one or more devjs ESLint rules were disabled

devjs Compiler only works when your components follow all the rules of devjs, disabling them may result in unexpected or incorrect behavior. Found suppression `eslint-disable devjs-hooks/rules-of-hooks`.

error.invalid-unclosed-eslint-suppression.ts:2:0
  1 | // Note: Everything below this is sketchy @validateExhaustiveMemoizationDependencies:false
> 2 | /* eslint-disable devjs-hooks/rules-of-hooks */
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found devjs rule suppression
  3 | function lowercasecomponent() {
  4 |   'use forget';
  5 |   const x = [];
```
          
      