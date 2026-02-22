
## Input

```javascript
// @enableFlowSuppressions

function Foo(props) {
  // $FlowFixMe[devjs-rule-hook]
  useX();
  return null;
}

```


## Error

```
Found 1 error:

Error: Devjs Compiler has skipped optimizing this component because one or more Devjs rule violations were reported by Flow

Devjs Compiler only works when your components follow all the rules of Devjs, disabling them may result in unexpected or incorrect behavior. Found suppression `$FlowFixMe[devjs-rule-hook]`.

error.bailout-on-flow-suppression.ts:4:2
  2 |
  3 | function Foo(props) {
> 4 |   // $FlowFixMe[devjs-rule-hook]
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found Devjs rule suppression
  5 |   useX();
  6 |   return null;
  7 | }
```
          
      