'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CalendarEvent,
  downloadICS,
  getGoogleCalendarUrl,
  getOutlookUrl,
  getYahooCalendarUrl,
} from '@/lib/calendar/export';

// Icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const OutlookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.152-.352.228-.58.228h-8.547V6.576h8.546c.229 0 .423.076.58.228.159.152.239.345.239.583z" />
    <path fill="#0364B8" d="M14.635 6.577v12.092H5.682c-.23 0-.424-.076-.58-.228-.158-.153-.237-.346-.237-.576V7.389c0-.23.079-.424.237-.577.156-.152.35-.228.58-.228h8.953z" />
    <path fill="#28A8EA" d="M9.818 12.625l-1.312 3.546a.248.248 0 01-.232.16H7.26a.248.248 0 01-.232-.347l3.037-7.746a.248.248 0 01.231-.159h1.408c.102 0 .194.063.231.159l3.037 7.746a.248.248 0 01-.232.347h-1.014a.248.248 0 01-.232-.16l-1.312-3.546H9.818z" />
    <path fill="#0078D4" d="M0 6.577v10.478c0 .23.079.424.237.576.156.152.35.228.58.228h8.547V6.577H.817a.789.789 0 00-.58.227A.789.789 0 000 7.387v-.81z" opacity=".1" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

interface CalendarExportProps {
  event: CalendarEvent;
  className?: string;
}

export function CalendarExport({ event, className }: CalendarExportProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(event), '_blank');
    setIsOpen(false);
  };

  const handleAppleCalendar = () => {
    downloadICS(event);
    setIsOpen(false);
  };

  const handleOutlook = () => {
    window.open(getOutlookUrl(event), '_blank');
    setIsOpen(false);
  };

  const handleDownloadICS = () => {
    downloadICS(event);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <CalendarIcon />
        Add toLog
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50 py-2">
            <button
              type="button"
              onClick={handleGoogleCalendar}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-gray-50 transition-colors"
            >
              <GoogleIcon />
              <span className="text-sm text-gray-700">Google Calendar</span>
            </button>

            <button
              type="button"
              onClick={handleAppleCalendar}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-gray-50 transition-colors"
            >
              <AppleIcon />
              <span className="text-sm text-gray-700">Apple Calendar</span>
            </button>

            <button
              type="button"
              onClick={handleOutlook}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-gray-50 transition-colors"
            >
              <OutlookIcon />
              <span className="text-sm text-gray-700">Outlook</span>
            </button>

            <div className="border-t my-2" />

            <button
              type="button"
              onClick={handleDownloadICS}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-gray-50 transition-colors"
            >
              <DownloadIcon />
              <span className="text-sm text-gray-700">Download file ICS</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Quick export button for immediate ICS download
 */
export function QuickCalendarExport({ event, className }: CalendarExportProps) {
  const handleClick = () => {
    downloadICS(event);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm text-calm-600 hover:text-calm-700 ${className}`}
    >
      <CalendarIcon />
      <span>Add toLog</span>
    </button>
  );
}
