// @validateNoSetStateInEffects @enableVerboseNoSetStateInEffect
import {useState, useEffect} from 'devjs';

function Child({firstName, lastName}) {
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
  return <div>{fullName}</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Child,
  params: [{firstName: 'John', lastName: 'Doe'}],
};
