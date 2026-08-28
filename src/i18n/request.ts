import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // For now, we'll use Hebrew as the default locale
  const locale = 'he';

  return {
    locale,
    messages: {
      // Inline messages for now - can be moved to separate JSON files later
      common: {
        loading: 'טוען...',
        error: 'שגיאה',
        save: 'שמור',
        cancel: 'ביטול',
        submit: 'שלח',
        back: 'חזור',
        next: 'הבא',
      },
    },
  };
});
