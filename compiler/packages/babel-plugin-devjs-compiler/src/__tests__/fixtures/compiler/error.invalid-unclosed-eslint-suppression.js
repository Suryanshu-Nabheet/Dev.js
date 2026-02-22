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
