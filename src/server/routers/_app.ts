import { router } from '../trpc';
import { authRouter } from './auth';
import { patientRouter } from './patient';
import { therapistRouter } from './therapist';
import { sessionRouter } from './session';
import { matchingRouter } from './matching';
import { questionnaireRouter } from './questionnaire';
import { adminRouter } from './admin';
import { messagesRouter } from './messages';
import { notificationRouter } from './notification';
import { schedulingRouter } from './scheduling';
import { clinicalRouter } from './clinical';
import { adminEmailRouter } from './admin-email';

/**
 * Main application router
 * All routes are merged here
 */
export const appRouter = router({
  auth: authRouter,
  patient: patientRouter,
  therapist: therapistRouter,
  session: sessionRouter,
  matching: matchingRouter,
  questionnaire: questionnaireRouter,
  admin: adminRouter,
  adminEmail: adminEmailRouter,
  messages: messagesRouter,
  notification: notificationRouter,
  scheduling: schedulingRouter,
  clinical: clinicalRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
