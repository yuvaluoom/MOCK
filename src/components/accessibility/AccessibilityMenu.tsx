'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface AccessibilitySettings {
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  wordSpacing: number;
  highContrast: boolean;
  invertColors: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  focusIndicator: boolean;
  dyslexiaFont: boolean;
  cursorSize: 'normal' | 'large';
  reduceMotion: boolean;
  hideImages: boolean;
  readingGuide: boolean;
  textAlign: 'default' | 'left' | 'center' | 'right';
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  letterSpacing: 0,
  lineHeight: 0,
  wordSpacing: 0,
  highContrast: false,
  invertColors: false,
  grayscale: false,
  highlightLinks: false,
  focusIndicator: true,
  dyslexiaFont: false,
  cursorSize: 'normal',
  reduceMotion: false,
  hideImages: false,
  readingGuide: false,
  textAlign: 'default',
};

const STORAGE_KEY = 'matchmind-a11y';

const AccessibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
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

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

function StepperControl({
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  unit,
  onDecrease,
  onIncrease,
  onReset,
  formatDisplay,
}: {
  label: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onReset: () => void;
  formatDisplay?: (v: number) => string;
}) {
  const isDefault = value === defaultValue;
  const display = formatDisplay ? formatDisplay(value) : `${value}${unit}`;

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onDecrease}
          disabled={value <= min}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg font-bold focus:outline-none focus:ring-2 focus:ring-calm-500"
          aria-label={`Decrease ${label}`}
        >
          &minus;
        </button>
        <span className="w-14 text-center text-sm font-medium text-gray-900 tabular-nums" aria-live="polite">
          {display}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={value >= max}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg font-bold focus:outline-none focus:ring-2 focus:ring-calm-500"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
        {!isDefault && (
          <button
            type="button"
            onClick={onReset}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-calm-500"
            aria-label={`Reset ${label} to default`}
          >
            <ResetIcon />
          </button>
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-1 ${
        active
          ? 'bg-calm-50 border-calm-500 text-calm-700 shadow-sm'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <span className="text-lg" aria-hidden="true">{icon}</span>
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </button>
  );
}

function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;
  const body = document.body;

  // Font size — applied to html element, cascades via rem
  root.style.fontSize = settings.fontSize === 100 ? '' : `${settings.fontSize}%`;

  // Letter spacing (WCAG 1.4.12)
  body.style.letterSpacing = settings.letterSpacing === 0 ? '' : `${settings.letterSpacing}px`;

  // Line height
  body.style.lineHeight = settings.lineHeight === 0 ? '' : `${1.5 + settings.lineHeight * 0.25}`;

  // Word spacing (WCAG 1.4.12)
  body.style.wordSpacing = settings.wordSpacing === 0 ? '' : `${settings.wordSpacing}px`;

  // Text alignment
  root.classList.remove('a11y-align-left', 'a11y-align-center', 'a11y-align-right');
  if (settings.textAlign !== 'default') {
    root.classList.add(`a11y-align-${settings.textAlign}`);
  }

  // High contrast
  root.classList.toggle('a11y-high-contrast', settings.highContrast);

  // Invert colors
  root.classList.toggle('a11y-invert', settings.invertColors);

  // Grayscale
  root.classList.toggle('a11y-grayscale', settings.grayscale);

  // Reduce motion
  root.classList.toggle('a11y-reduce-motion', settings.reduceMotion);

  // Highlight links
  root.classList.toggle('a11y-highlight-links', settings.highlightLinks);

  // Focus indicator
  root.classList.toggle('a11y-focus-indicator', settings.focusIndicator);

  // Dyslexia-friendly font
  root.classList.toggle('a11y-dyslexia-font', settings.dyslexiaFont);

  // Cursor size
  root.classList.toggle('a11y-cursor-large', settings.cursorSize === 'large');

  // Hide images
  root.classList.toggle('a11y-hide-images', settings.hideImages);

  // Reading guide
  root.classList.toggle('a11y-reading-guide', settings.readingGuide);
}

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Load settings on mount and apply
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...defaultSettings, ...parsed };
        setSettings(merged);
        applySettings(merged);
      }
    } catch {
      // Use defaults
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => {
        const next = { ...prev, reduceMotion: true };
        applySettings(next);
        return next;
      });
    }
  }, []);

  // Apply settings whenever they change
  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage full or unavailable
    }
  }, [settings]);

  // Reading guide mouse follower
  useEffect(() => {
    if (!settings.readingGuide) return;

    let guide = document.getElementById('a11y-reading-guide');
    if (!guide) {
      guide = document.createElement('div');
      guide.id = 'a11y-reading-guide';
      document.body.appendChild(guide);
    }
    guide.style.cssText = 'position:fixed;left:0;right:0;height:12px;pointer-events:none;z-index:9999;background:rgba(255,255,0,0.35);border-top:2px solid rgba(0,0,0,0.15);border-bottom:2px solid rgba(0,0,0,0.15);transition:top 0.05s linear;';

    const handleMouseMove = (e: MouseEvent) => {
      if (guide) guide.style.top = `${e.clientY - 6}px`;
    };
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      guide?.remove();
    };
  }, [settings.readingGuide]);

  const update = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    setSettings(defaultSettings);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
  };

  const isModified = JSON.stringify(settings) !== JSON.stringify(defaultSettings);

  // Keyboard: Escape to close, Alt+A to toggle
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
    if (e.altKey && e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus trap
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      const trap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      };

      document.addEventListener('keydown', trap);
      first?.focus();
      return () => document.removeEventListener('keydown', trap);
    }
  }, [isOpen]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (triggerRef.current?.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <>
      {/* Floating trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 left-4 z-[60] w-12 h-12 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-2 transition-colors flex items-center justify-center ${
          isModified ? 'bg-calm-700 text-white hover:bg-calm-800' : 'bg-calm-600 text-white hover:bg-calm-700'
        }`}
        aria-label="Open accessibility menu (Alt+A)"
        aria-expanded={isOpen}
        aria-controls="accessibility-menu"
        aria-haspopup="dialog"
        title="Accessibility settings (Alt+A)"
      >
        <AccessibilityIcon />
        {isModified && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white" aria-hidden="true" />
        )}
      </button>

      {/* Menu overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" aria-hidden="true" onClick={() => setIsOpen(false)} />

          <div
            ref={menuRef}
            id="accessibility-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-menu-title"
            className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-auto z-[60] w-full sm:w-[420px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-calm-100 flex items-center justify-center text-calm-700">
                  <AccessibilityIcon />
                </div>
                <div>
                  <h2 id="a11y-menu-title" className="text-base font-semibold text-gray-900">
                    Accessibility Settings
                  </h2>
                  <p className="text-[10px] text-gray-400">WCAG 2.1 AA &bull; SI 5568 &bull; Alt+A</p>
                </div>
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">

              {/* Text Adjustments */}
              <section aria-labelledby="a11y-text-heading">
                <h3 id="a11y-text-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Text Adjustments
                </h3>
                <div className="space-y-0.5 bg-gray-50 rounded-xl p-3">
                  <StepperControl
                    label="Font Size"
                    value={settings.fontSize}
                    defaultValue={100}
                    min={80}
                    max={200}
                    step={10}
                    unit="%"
                    onDecrease={() => update('fontSize', Math.max(80, settings.fontSize - 10))}
                    onIncrease={() => update('fontSize', Math.min(200, settings.fontSize + 10))}
                    onReset={() => update('fontSize', 100)}
                  />
                  <StepperControl
                    label="Letter Spacing"
                    value={settings.letterSpacing}
                    defaultValue={0}
                    min={0}
                    max={10}
                    step={1}
                    unit="px"
                    onDecrease={() => update('letterSpacing', Math.max(0, settings.letterSpacing - 1))}
                    onIncrease={() => update('letterSpacing', Math.min(10, settings.letterSpacing + 1))}
                    onReset={() => update('letterSpacing', 0)}
                  />
                  <StepperControl
                    label="Word Spacing"
                    value={settings.wordSpacing}
                    defaultValue={0}
                    min={0}
                    max={10}
                    step={1}
                    unit="px"
                    onDecrease={() => update('wordSpacing', Math.max(0, settings.wordSpacing - 1))}
                    onIncrease={() => update('wordSpacing', Math.min(10, settings.wordSpacing + 1))}
                    onReset={() => update('wordSpacing', 0)}
                  />
                  <StepperControl
                    label="Line Height"
                    value={settings.lineHeight}
                    defaultValue={0}
                    min={0}
                    max={6}
                    step={1}
                    unit=""
                    formatDisplay={(v) => v === 0 ? 'Default' : `+${v}`}
                    onDecrease={() => update('lineHeight', Math.max(0, settings.lineHeight - 1))}
                    onIncrease={() => update('lineHeight', Math.min(6, settings.lineHeight + 1))}
                    onReset={() => update('lineHeight', 0)}
                  />
                </div>
              </section>

              {/* Text Alignment */}
              <section aria-labelledby="a11y-align-heading">
                <h3 id="a11y-align-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Text Alignment
                </h3>
                <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Text alignment">
                  {([
                    { value: 'default' as const, label: 'Default', icon: '⊞' },
                    { value: 'left' as const, label: 'Left', icon: '☰' },
                    { value: 'center' as const, label: 'Center', icon: '☰' },
                    { value: 'right' as const, label: 'Right', icon: '☰' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={settings.textAlign === opt.value}
                      onClick={() => update('textAlign', opt.value)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all focus:outline-none focus:ring-2 focus:ring-calm-500 ${
                        settings.textAlign === opt.value
                          ? 'bg-calm-50 border-calm-500 text-calm-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Visual & Color */}
              <section aria-labelledby="a11y-visual-heading">
                <h3 id="a11y-visual-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Color & Display
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <ToggleButton
                    active={settings.highContrast}
                    onClick={() => update('highContrast', !settings.highContrast)}
                    icon="◑"
                    label="High Contrast"
                  />
                  <ToggleButton
                    active={settings.invertColors}
                    onClick={() => update('invertColors', !settings.invertColors)}
                    icon="◐"
                    label="Invert Colors"
                  />
                  <ToggleButton
                    active={settings.grayscale}
                    onClick={() => update('grayscale', !settings.grayscale)}
                    icon="◻"
                    label="Grayscale"
                  />
                  <ToggleButton
                    active={settings.highlightLinks}
                    onClick={() => update('highlightLinks', !settings.highlightLinks)}
                    icon="🔗"
                    label="Highlight Links"
                  />
                  <ToggleButton
                    active={settings.hideImages}
                    onClick={() => update('hideImages', !settings.hideImages)}
                    icon="🖼"
                    label="Hide Images"
                  />
                  <ToggleButton
                    active={settings.cursorSize === 'large'}
                    onClick={() => update('cursorSize', settings.cursorSize === 'large' ? 'normal' : 'large')}
                    icon="↗"
                    label="Large Cursor"
                  />
                </div>
              </section>

              {/* Reading & Navigation */}
              <section aria-labelledby="a11y-reading-heading">
                <h3 id="a11y-reading-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Reading & Navigation
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <ToggleButton
                    active={settings.dyslexiaFont}
                    onClick={() => update('dyslexiaFont', !settings.dyslexiaFont)}
                    icon="Aa"
                    label="Dyslexia Font"
                  />
                  <ToggleButton
                    active={settings.readingGuide}
                    onClick={() => update('readingGuide', !settings.readingGuide)}
                    icon="—"
                    label="Reading Guide"
                  />
                  <ToggleButton
                    active={settings.reduceMotion}
                    onClick={() => update('reduceMotion', !settings.reduceMotion)}
                    icon="⏸"
                    label="Stop Animations"
                  />
                  <ToggleButton
                    active={settings.focusIndicator}
                    onClick={() => update('focusIndicator', !settings.focusIndicator)}
                    icon="⊡"
                    label="Focus Ring"
                  />
                </div>
              </section>

              {/* Compliance badge */}
              <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-xl space-y-1">
                <p className="font-semibold text-gray-700">WCAG 2.1 Level AA &bull; Israeli Standard SI 5568</p>
                <p>Compliant with Israeli Equal Rights for Persons with Disabilities Regulations. Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[10px]">Tab</kbd> to navigate, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[10px]">Esc</kbd> to close, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[10px]">Alt+A</kbd> to toggle.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white flex-shrink-0 flex gap-3">
              <button
                type="button"
                onClick={resetAll}
                disabled={!isModified}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-calm-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ResetIcon />
                Reset All
              </button>
              <a
                href="/accessibility"
                className="flex-1 py-2.5 px-4 text-sm font-medium text-calm-700 bg-calm-50 rounded-lg hover:bg-calm-100 focus:outline-none focus:ring-2 focus:ring-calm-500 transition-colors text-center inline-flex items-center justify-center"
              >
                Accessibility Statement
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
