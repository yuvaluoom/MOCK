'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettings, resetSettings, type AppSettings } from '@/lib/settings';

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

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

// Toggle component for consistency
function Toggle({
  checked,
  onChange,
  variant = 'default',
}: {
  checked: boolean;
  onChange: () => void;
  variant?: 'default' | 'danger' | 'success';
}) {
  const colors = {
    default: checked ? 'bg-amber-500' : 'bg-gray-300',
    danger: checked ? 'bg-red-500' : 'bg-gray-300',
    success: checked ? 'bg-green-500' : 'bg-gray-300',
  };

  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${colors[variant]}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getSettings);
  const [saved, setSaved] = useState(false);

  // Sync from the store on mount
  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      const defaults = resetSettings();
      setSettings(defaults);
      setSaved(false);
    }
  };

  const weightTotal =
    settings.xFactorWeight +
    settings.healthFundWeight +
    settings.availabilityWeight +
    settings.preferencesWeight;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-1">
            Configure platform behavior and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircleIcon />
              Saved
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium text-sm"
          >
            <SaveIcon />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matching Algorithm Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Matching Algorithm</h2>
          <div className="space-y-5">
            {[
              { key: 'xFactorWeight' as const, label: 'X-Factor Weight' },
              { key: 'healthFundWeight' as const, label: 'Health Fund Weight' },
              { key: 'availabilityWeight' as const, label: 'Availability Weight' },
              { key: 'preferencesWeight' as const, label: 'Preferences Weight' },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-600">{item.label}</label>
                  <span className="text-sm font-semibold text-gray-900">{settings[item.key]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings[item.key]}
                  onChange={(e) =>
                    setSettings({ ...settings, [item.key]: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            ))}

            <div className="pt-3 border-t border-gray-100">
              <p className={`text-sm font-medium ${weightTotal === 100 ? 'text-green-600' : 'text-red-600'}`}>
                Total: {weightTotal}%
                {weightTotal !== 100 && (
                  <span className="ml-2 font-normal">(must equal 100%)</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Minimum Match Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.minMatchScore}
                  onChange={(e) =>
                    setSettings({ ...settings, minMatchScore: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Maximum Matches</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxMatchesPerPatient}
                  onChange={(e) =>
                    setSettings({ ...settings, maxMatchesPerPatient: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Notifications</h2>
          <div className="space-y-5">
            {[
              { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Send system emails to users' },
              { key: 'smsNotifications' as const, label: 'SMS Notifications', desc: 'Send SMS reminders (additional cost)' },
              { key: 'sessionReminders' as const, label: 'Session Reminders', desc: 'Remind users before sessions' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  checked={settings[item.key]}
                  onChange={() => setSettings({ ...settings, [item.key]: !settings[item.key] })}
                />
              </div>
            ))}
            <div className="pt-3 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-600 block mb-2">Reminder time (hours before)</label>
              <input
                type="number"
                min="1"
                max="72"
                value={settings.reminderHours}
                onChange={(e) =>
                  setSettings({ ...settings, reminderHours: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Security</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Session timeout (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Maximum login attempts</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Require MFA</p>
                <p className="text-xs text-gray-500 mt-0.5">Two-factor authentication for all users</p>
              </div>
              <Toggle
                checked={settings.requireMFA}
                onChange={() => setSettings({ ...settings, requireMFA: !settings.requireMFA })}
              />
            </div>
            <div className="pt-3 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-600 block mb-2">Audit log retention (days)</label>
              <input
                type="number"
                min="30"
                max="365"
                value={settings.auditLogRetention}
                onChange={(e) =>
                  setSettings({ ...settings, auditLogRetention: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">System</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">Temporarily restrict user access</p>
              </div>
              <Toggle
                checked={settings.maintenanceMode}
                onChange={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                variant="danger"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Debug Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">Enable detailed logging</p>
              </div>
              <Toggle
                checked={settings.debugMode}
                onChange={() => setSettings({ ...settings, debugMode: !settings.debugMode })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Allow New Registrations</p>
                <p className="text-xs text-gray-500 mt-0.5">Allow new users to register</p>
              </div>
              <Toggle
                checked={settings.allowNewRegistrations}
                onChange={() => setSettings({ ...settings, allowNewRegistrations: !settings.allowNewRegistrations })}
                variant="success"
              />
            </div>
            <div className="pt-3 border-t border-gray-100">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                <RefreshIcon />
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-red-700 mb-4">Danger Zone</h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Reset All Settings</p>
            <p className="text-sm text-gray-500">
              Reset all settings to defaults. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap text-sm font-medium"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
