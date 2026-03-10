/**
 * Shared API error handler for consistent user feedback.
 * Converts API/network errors into a toast-friendly message.
 *
 * @param {Error|{ message?: string, response?: { data?: { message?: string } } }} error - Caught error
 * @param {string} action - Short description of what failed (e.g. 'loading workouts')
 * @param {function} [toast] - Chakra useToast() result; if provided, shows a toast
 */
export function handleApiError(error, action, toast) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    (typeof error === 'string' ? error : 'Something went wrong');

  if (typeof toast === 'function') {
    toast({
      title: `Error ${action}`,
      description: message,
      status: 'error',
      duration: 4000,
      isClosable: true,
    });
  } else {
    console.error(`[API] ${action}:`, message, error);
  }
}
