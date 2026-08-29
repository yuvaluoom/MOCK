/**
 * In-memory settings store for the admin panel.
 * Persists across page navigations within the same server process.
 * Readable from any part of the app via `getSettings()`.
 */

export interface AppSettings {
  // Matching algorithm
  xFactorWeight: number;
  healthFundWeight: number;
  availabilityWeight: number;
  preferencesWeight: number;
  minMatchScore: number;
  maxMatchesPerPatient: number;

  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  sessionReminders: boolean;
  reminderHours: number;

  // Security
  sessionTimeout: number;
  maxLoginAttempts: number;
  requireMFA: boolean;
  auditLogRetention: number;

  // System
  maintenanceMode: boolean;
  debugMode: boolean;
  allowNewRegistrations: boolean;
}

const defaults: AppSettings = {
  xFactorWeight: 40,
  healthFundWeight: 25,
  availabilityWeight: 20,
  preferencesWeight: 15,
  minMatchScore: 60,
  maxMatchesPerPatient: 10,

  emailNotifications: true,
  smsNotifications: false,
  sessionReminders: true,
  reminderHours: 24,

  sessionTimeout: 30,
  maxLoginAttempts: 5,
  requireMFA: false,
  auditLogRetention: 90,

  maintenanceMode: false,
  debugMode: false,
  allowNewRegistrations: true,
};

// The single mutable store -- survives across imports within one process.
let currentSettings: AppSettings = { ...defaults };

/** Return the current settings (shallow copy). */
export function getSettings(): AppSettings {
  return { ...currentSettings };
}

/** Merge partial updates into the store. */
export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  currentSettings = { ...currentSettings, ...patch };
  return { ...currentSettings };
}

/** Reset everything back to factory defaults. */
export function resetSettings(): AppSettings {
  currentSettings = { ...defaults };
  return { ...currentSettings };
}

/** Return the factory defaults (read-only copy). */
export function getDefaults(): AppSettings {
  return { ...defaults };
}
