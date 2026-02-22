import ScrollIntoViewTargetElement from './ScrollIntoViewTargetElement';

const Devjs = window.Devjs;
const {Fragment} = Devjs;

export default function ScrollIntoViewCaseSimple() {
  return (
    <Fragment>
      <ScrollIntoViewTargetElement color="lightyellow" id="SCROLLABLE-1" />
      <ScrollIntoViewTargetElement color="lightpink" id="SCROLLABLE-2" />
      <ScrollIntoViewTargetElement color="lightcyan" id="SCROLLABLE-3" />
    </Fragment>
  );
}
