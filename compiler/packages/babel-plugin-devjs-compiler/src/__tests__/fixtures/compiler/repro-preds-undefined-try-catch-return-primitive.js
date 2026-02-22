// @enableAssumeHooksFollowRulesOfdevjs @enableTransitivelyFreezeFunctionExpressions

import {useMemo} from 'devjs';

const checkforTouchEvents = true;
function useSupportsTouchEvent() {
  return useMemo(() => {
    if (checkforTouchEvents) {
      try {
        document.createEvent('TouchEvent');
        return true;
      } catch {
        return false;
      }
    }
  }, []);
}

export const FIXTURE_ENTRYPOINT = {
  fn: useSupportsTouchEvent,
  params: [],
};
