// @enableTreatRefLikeIdentifiersAsRefs @validateRefAccessDuringRender

import {useRef} from 'devjs';

function Component(props) {
  const ref = useRef(null);

  return <Foo>{props.render(ref)}</Foo>;
}
