'use client';

import { useState } from 'react';

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Matching settings
    xFactorWeight: 40,
    healthFundWeight: 25,
    availabilityWeight: 20,
    preferencesWeight: 15,
    minMatchScore: 60,
    maxMatchesPerPatient: 10,

    // Notification settings
    emailNotifications: true,
    smsNotifications: false,
    sessionReminders: true,
    reminderHours: 24,

    // Security settings
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireMFA: false,
    auditLogRetention: 90,

    // System settings
    maintenanceMode: false,
    debugMode: false,
    allowNewRegistrations: true,
  });

  const handleSave = () => {
    // In production, this would call an API to save settings
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400 mt-1">
            Configure platform behavior and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <SaveIcon />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matching Algorithm Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Matching Algorithm</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-400">X-Factor Weight</label>
                <span className="text-white font-medium">{settings.xFactorWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.xFactorWeight}
                onChange={(e) =>
                  setSettings({ ...settings, xFactorWeight: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-400">Health Fund Weight</label>
                <span className="text-white font-medium">{settings.healthFundWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.healthFundWeight}
                onChange={(e) =>
                  setSettings({ ...settings, healthFundWeight: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-400">Availability Weight</label>
                <span className="text-white font-medium">{settings.availabilityWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.availabilityWeight}
                onChange={(e) =>
                  setSettings({ ...settings, availabilityWeight: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-400">Preferences Weight</label>
                <span className="text-white font-medium">{settings.preferencesWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.preferencesWeight}
                onChange={(e) =>
                  setSettings({ ...settings, preferencesWeight: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div className="pt-4 border-t border-slate-700">
              <p className="text-sm text-amber-400">
                Total: {settings.xFactorWeight + settings.healthFundWeight + settings.availabilityWeight + settings.preferencesWeight}%
                {settings.xFactorWeight + settings.healthFundWeight + settings.availabilityWeight + settings.preferencesWeight !== 100 && (
                  <span className="text-red-400 mr-2">(must equal 100%)</span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Minimum Match Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.minMatchScore}
                  onChange={(e) =>
                    setSettings({ ...settings, minMatchScore: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Maximum Matches</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxMatchesPerPatient}
                  onChange={(e) =>
                    setSettings({ ...settings, maxMatchesPerPatient: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Notifications Email</p>
                <p className="text-sm text-slate-400">Send system emails to users</p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, emailNotifications: !settings.emailNotifications })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.emailNotifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Notifications SMS</p>
                <p className="text-sm text-slate-400">Send SMS reminders (additional cost)</p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, smsNotifications: !settings.smsNotifications })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.smsNotifications ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.smsNotifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Session Reminders</p>
                <p className="text-sm text-slate-400">Remind users before sessions</p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, sessionReminders: !settings.sessionReminders })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.sessionReminders ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.sessionReminders ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="pt-4">
              <label className="text-sm text-slate-400 block mb-2">Reminder time (hours before)</label>
              <input
                type="number"
                min="1"
                max="72"
                value={settings.reminderHours}
                onChange={(e) =>
                  setSettings({ ...settings, reminderHours: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Security</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Session timeout (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Maximum login attempts</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-white">Require MFA</p>
                <p className="text-sm text-slate-400">Two-factor authentication for all users</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, requireMFA: !settings.requireMFA })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.requireMFA ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.requireMFA ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="pt-4">
              <label className="text-sm text-slate-400 block mb-2">Audit log retention (days)</label>
              <input
                type="number"
                min="30"
                max="365"
                value={settings.auditLogRetention}
                onChange={(e) =>
                  setSettings({ ...settings, auditLogRetention: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">System</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Maintenance Mode</p>
                <p className="text-sm text-slate-400">Temporarily restrict user access</p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.maintenanceMode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Debug Mode</p>
                <p className="text-sm text-slate-400">Enable detailed logging</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, debugMode: !settings.debugMode })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.debugMode ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.debugMode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Allow New Registrations</p>
                <p className="text-sm text-slate-400">Allow new users to register</p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, allowNewRegistrations: !settings.allowNewRegistrations })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.allowNewRegistrations ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.allowNewRegistrations ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="pt-4 border-t border-slate-700">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                <RefreshIcon />
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white">Reset All Settings</p>
            <p className="text-sm text-slate-400">
              Reset all settings to defaults. This action cannot be undone.
            </p>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
