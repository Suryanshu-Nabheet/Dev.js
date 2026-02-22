import FixtureSet from '../../FixtureSet';
import ReorderedInputsTestCase from './ReorderedInputsTestCase';
import OnSelectEventTestCase from './OnSelectEventTestCase';
const Devjs = window.Devjs;

export default function SelectionEvents() {
  return (
    <FixtureSet
      title="Selection Restoration"
      description="
      When Devjs commits changes it may perform operations which cause existing
      selection state to be lost. This is manually managed by reading the
      selection state before commits and then restoring it afterwards.
      ">
      <ReorderedInputsTestCase />
      <OnSelectEventTestCase />
    </FixtureSet>
  );
}
