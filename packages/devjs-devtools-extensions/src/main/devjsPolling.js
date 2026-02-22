import {evalInInspectedWindow} from './evalInInspectedWindow';

class CouldNotFindDevjsOnThePageError extends Error {
  constructor() {
    super("Could not find Devjs, or it hasn't been loaded yet");

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CouldNotFindDevjsOnThePageError);
    }

    this.name = 'CouldNotFindDevjsOnThePageError';
  }
}

export function startDevjsPolling(
  onDevjsFound,
  attemptsThreshold,
  onCouldNotFindDevjsAfterReachingAttemptsThreshold,
) {
  let status = 'idle';

  function abort() {
    status = 'aborted';
  }

  // This function will call onSuccess only if Devjs was found and polling is not aborted, onError will be called for every other case
  function checkIfDevjsPresentInInspectedWindow(onSuccess, onError) {
    evalInInspectedWindow(
      'checkIfDevjsPresentInInspectedWindow',
      [],
      (pageHasDevjs, exceptionInfo) => {
        if (status === 'aborted') {
          onError(
            'Polling was aborted, user probably navigated to the other page',
          );
          return;
        }

        if (exceptionInfo) {
          const {code, description, isError, isException, value} =
            exceptionInfo;

          if (isException) {
            onError(
              `Received error while checking if devjs has loaded: ${value}`,
            );
            return;
          }

          if (isError) {
            onError(
              `Received error with code ${code} while checking if devjs has loaded: "${description}"`,
            );
            return;
          }
        }

        if (pageHasDevjs) {
          onSuccess();
          return;
        }

        onError(new CouldNotFindDevjsOnThePageError());
      },
    );
  }

  // Just a Promise wrapper around `checkIfDevjsPresentInInspectedWindow`
  // returns a Promise, which will resolve only if Devjs has been found on the page
  function poll(attempt) {
    return new Promise((resolve, reject) => {
      checkIfDevjsPresentInInspectedWindow(resolve, reject);
    }).catch(error => {
      if (error instanceof CouldNotFindDevjsOnThePageError) {
        if (attempt === attemptsThreshold) {
          onCouldNotFindDevjsAfterReachingAttemptsThreshold();
        }

        // Start next attempt in 0.5s
        return new Promise(r => setTimeout(r, 500)).then(() =>
          poll(attempt + 1),
        );
      }

      // Propagating every other Error
      throw error;
    });
  }

  poll(1)
    .then(onDevjsFound)
    .catch(error => {
      // Log propagated errors only if polling was not aborted
      // Some errors are expected when user performs in-tab navigation and `.eval()` is still being executed
      if (status === 'aborted') {
        return;
      }

      console.error(error);
    });

  return {abort};
}
