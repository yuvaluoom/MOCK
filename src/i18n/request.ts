import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // For now, we'll use Hebrew as the default locale
  const locale = 'he';

  return {
    locale,
    messages: {
      // Inline messages for now - can be moved to separate JSON files later
      common: {
        loading: 'Loading...',
        error: 'Error',
        save: 'Save',
        cancel: 'Cancel',
        submit: 'Send',
        back: 'Back',
        next: 'Next',
      },
    },
  };
});
