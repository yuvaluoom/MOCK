'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reduceMotion: boolean;
  highlightLinks: boolean;
  focusIndicator: boolean;
  dyslexiaFont: boolean;
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  cursorSize: 'normal' | 'large';
  textToSpeech: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  reduceMotion: false,
  highlightLinks: false,
  focusIndicator: true,
  dyslexiaFont: false,
  lineSpacing: 'normal',
  cursorSize: 'normal',
  textToSpeech: false,
};

const AccessibilityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <circle cx="12" cy="4.5" r="2.5" />
    <path d="m7 21 2.5-9" />
    <path d="m17 21-2.5-9" />
    <path d="M12 12V7" />
    <path d="M7.5 8h9" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Toggle Switch Component
function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}) {
  const id = label.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-2 ${
          checked ? 'bg-calm-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        // Invalid JSON, use defaults
      }
    }

    // Check for user's system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reduceMotion: true }));
    }
    if (window.matchMedia('(prefers-contrast: more)').matches) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.classList.remove('a11y-font-normal', 'a11y-font-large', 'a11y-font-xlarge');
    root.classList.add(`a11y-font-${settings.fontSize}`);

    // High contrast
    root.classList.toggle('a11y-high-contrast', settings.highContrast);

    // Reduce motion
    root.classList.toggle('a11y-reduce-motion', settings.reduceMotion);

    // Highlight links
    root.classList.toggle('a11y-highlight-links', settings.highlightLinks);

    // Focus indicator
    root.classList.toggle('a11y-focus-indicator', settings.focusIndicator);

    // Dyslexia-friendly font
    root.classList.toggle('a11y-dyslexia-font', settings.dyslexiaFont);

    // Line spacing
    root.classList.remove('a11y-line-normal', 'a11y-line-relaxed', 'a11y-line-loose');
    root.classList.add(`a11y-line-${settings.lineSpacing}`);

    // Cursor size
    root.classList.toggle('a11y-cursor-large', settings.cursorSize === 'large');

    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
  };

  // Keyboard handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus trap for modal
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const triggerButton = triggerRef.current;
        if (triggerButton && triggerButton.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Floating accessibility button - WCAG accessible icon button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-calm-600 text-white shadow-lg hover:bg-calm-700 focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
        aria-label="Open accessibility menu"
        aria-expanded={isOpen}
        aria-controls="accessibility-menu"
        aria-haspopup="dialog"
      >
        <AccessibilityIcon />
      </button>

      {/* Menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50"
            aria-hidden="true"
          />

          {/* Menu panel */}
          <div
            ref={menuRef}
            id="accessibility-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-menu-title"
            className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-auto z-50 w-full sm:w-96 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-calm-100 flex items-center justify-center">
                  <AccessibilityIcon />
                </div>
                <h2 id="a11y-menu-title" className="text-lg font-semibold text-gray-900">
                  Accessibility
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-500"
                aria-label="Close accessibility menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Text Size */}
              <section aria-labelledby="text-size-heading">
                <h3 id="text-size-heading" className="text-sm font-semibold text-gray-900 mb-3">
                  Text Size
                </h3>
                <div className="flex gap-2" role="radiogroup" aria-label="Text size">
                  {(['normal', 'large', 'xlarge'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateSetting('fontSize', size)}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium border-2 transition-all ${
                        settings.fontSize === size
                          ? 'bg-calm-50 border-calm-500 text-calm-700 ring-2 ring-calm-500 ring-offset-1'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                      role="radio"
                      aria-checked={settings.fontSize === size}
                    >
                      <span className={size === 'normal' ? 'text-base' : size === 'large' ? 'text-lg' : 'text-xl'}>
                        {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                      </span>
                      <span className="block text-xs mt-0.5 text-gray-500">
                        {size === 'normal' ? 'Default' : size === 'large' ? 'Large' : 'Extra Large'}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Line Spacing */}
              <section aria-labelledby="line-spacing-heading">
                <h3 id="line-spacing-heading" className="text-sm font-semibold text-gray-900 mb-3">
                  Line Spacing
                </h3>
                <div className="flex gap-2" role="radiogroup" aria-label="Line spacing">
                  {(['normal', 'relaxed', 'loose'] as const).map((spacing) => (
                    <button
                      key={spacing}
                      type="button"
                      onClick={() => updateSetting('lineSpacing', spacing)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                        settings.lineSpacing === spacing
                          ? 'bg-calm-50 border-calm-500 text-calm-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                      role="radio"
                      aria-checked={settings.lineSpacing === spacing}
                    >
                      {spacing === 'normal' ? 'Normal' : spacing === 'relaxed' ? 'Relaxed' : 'Loose'}
                    </button>
                  ))}
                </div>
              </section>

              {/* Visual Settings */}
              <section aria-labelledby="visual-settings-heading">
                <h3 id="visual-settings-heading" className="text-sm font-semibold text-gray-900 mb-3">
                  Visual Settings
                </h3>
                <div className="space-y-1 divide-y divide-gray-100">
                  <ToggleSwitch
                    checked={settings.highContrast}
                    onChange={() => updateSetting('highContrast', !settings.highContrast)}
                    label="High Contrast"
                    description="Increases color contrast for better visibility"
                  />
                  <ToggleSwitch
                    checked={settings.highlightLinks}
                    onChange={() => updateSetting('highlightLinks', !settings.highlightLinks)}
                    label="Highlight Links"
                    description="Underlines and highlights all clickable links"
                  />
                  <ToggleSwitch
                    checked={settings.cursorSize === 'large'}
                    onChange={() => updateSetting('cursorSize', settings.cursorSize === 'large' ? 'normal' : 'large')}
                    label="Large Cursor"
                    description="Increases the mouse cursor size"
                  />
                </div>
              </section>

              {/* Reading & Focus */}
              <section aria-labelledby="reading-settings-heading">
                <h3 id="reading-settings-heading" className="text-sm font-semibold text-gray-900 mb-3">
                  Reading & Focus
                </h3>
                <div className="space-y-1 divide-y divide-gray-100">
                  <ToggleSwitch
                    checked={settings.dyslexiaFont}
                    onChange={() => updateSetting('dyslexiaFont', !settings.dyslexiaFont)}
                    label="Dyslexia-Friendly Font"
                    description="Uses OpenDyslexic font for easier reading"
                  />
                  <ToggleSwitch
                    checked={settings.focusIndicator}
                    onChange={() => updateSetting('focusIndicator', !settings.focusIndicator)}
                    label="Enhanced Focus"
                    description="Shows clear visual focus indicators"
                  />
                  <ToggleSwitch
                    checked={settings.reduceMotion}
                    onChange={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                    label="Reduce Motion"
                    description="Minimizes animations and transitions"
                  />
                </div>
              </section>

              {/* WCAG Compliance Notice */}
              <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700 mb-1">WCAG 2.2 AA Compliant</p>
                <p>This website is designed to meet Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards.</p>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-4 border-t bg-white flex-shrink-0">
              <button
                type="button"
                onClick={resetSettings}
                className="w-full py-2.5 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-calm-500 transition-colors"
              >
                Reset to Defaults
              </button>

              {/* Keyboard shortcuts info */}
              <div className="text-xs text-gray-500 mt-3 text-center">
                <p>Use <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Tab</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Esc</kbd> to close</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
