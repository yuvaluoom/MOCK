'use client';

import { useState, useCallback } from 'react';

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const FileSpreadsheetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M8 13h2" />
    <path d="M14 13h2" />
    <path d="M8 17h2" />
    <path d="M14 17h2" />
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-400">
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-500">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  warnings: number;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings_list: Array<{ row: number; field: string; message: string }>;
}

type ImportStatus = 'idle' | 'validating' | 'importing' | 'complete' | 'error';

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [importSource, setImportSource] = useState<string>('csv');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      showToast('Please upload a CSV or Excel file', 'error');
      return;
    }

    setFile(selectedFile);
    setStatus('idle');
    setResult(null);

    const mockPreview = [
      { firstName: 'Yael', lastName: 'Cohen', email: 'yael@example.com', licenseNumber: 'PSY-001', city: 'Tel Aviv' },
      { firstName: 'David', lastName: 'Levi', email: 'david@example.com', licenseNumber: 'PSY-002', city: 'Jerusalem' },
      { firstName: 'Michal', lastName: 'Golan', email: 'michal@example.com', licenseNumber: 'PSY-003', city: 'Haifa' },
    ];
    setPreviewData(mockPreview);
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) return;

    setStatus('validating');
    setProgress(0);

    await new Promise((r) => setTimeout(r, 1000));
    setProgress(25);

    setStatus('importing');

    for (let i = 25; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 200));
      setProgress(i);
    }

    setResult({
      total: previewData.length,
      successful: previewData.length - 1,
      failed: 0,
      warnings: 1,
      errors: [],
      warnings_list: [
        { row: 2, field: 'phone', message: 'Phone number missing - using default value' },
      ],
    });

    setStatus('complete');
  }, [file, previewData]);

  const handleReset = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setPreviewData([]);
  }, []);

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,phone,licenseNumber,city,specializations,approaches,healthFunds,sessionPrice,yearsOfExperience
Yael,Cohen,yael@example.com,052-1234567,PSY-001,Tel Aviv,"Anxiety,Depression","CBT,DBT","Clalit,Maccabi",400,5
David,Levi,david@example.com,054-7654321,PSY-002,Jerusalem,"Trauma,PTSD","EMDR,Psychodynamic","Maccabi,Leumit",450,10`;

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'therapist_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Therapists</h1>
          <p className="text-gray-500 mt-1">
            Bulk import therapists from CSV or Excel files
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors self-start text-sm font-medium"
        >
          <DownloadIcon />
          Download Template
        </button>
      </div>

      {/* Import Source Selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Source</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'csv', label: 'CSV / Excel File', desc: 'Upload a spreadsheet file' },
            { id: 'healthfund', label: 'Health Fund Integration', desc: 'Coming soon' },
            { id: 'api', label: 'External API', desc: 'Coming soon' },
          ].map((source) => (
            <button
              key={source.id}
              onClick={() => source.id === 'csv' && setImportSource(source.id)}
              disabled={source.id !== 'csv'}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                importSource === source.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <p className="font-medium text-gray-900">{source.label}</p>
              <p className="text-sm text-gray-500 mt-1">{source.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">File Upload</h2>

        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 transition-colors bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
              <UploadIcon />
              <p className="mb-2 text-sm mt-4">
                <span className="font-semibold text-amber-600">Click to upload</span> or drag and drop a file here
              </p>
              <p className="text-xs text-gray-400">CSV or Excel file (up to 10MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
            />
          </label>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <FileSpreadsheetIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB &middot; {previewData.length} rows detected
                  </p>
                </div>
              </div>
              {status === 'idle' && (
                <button
                  onClick={handleReset}
                  className="text-gray-400 hover:text-gray-700 transition-colors text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Preview Table */}
            {previewData.length > 0 && status === 'idle' && (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">First Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Last Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">License</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-4 py-2 text-gray-900">{row.firstName}</td>
                        <td className="px-4 py-2 text-gray-900">{row.lastName}</td>
                        <td className="px-4 py-2 text-gray-600">{row.email}</td>
                        <td className="px-4 py-2 text-gray-600 font-mono text-xs">{row.licenseNumber}</td>
                        <td className="px-4 py-2 text-gray-600">{row.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <p className="text-sm text-gray-400 py-2 px-4 bg-gray-50">
                    ... and {previewData.length - 5} more rows
                  </p>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {(status === 'validating' || status === 'importing') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {status === 'validating' ? 'Validating data...' : 'Importing therapists...'}
                  </span>
                  <span className="text-gray-900 font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results */}
            {status === 'complete' && result && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                    <p className="text-sm text-gray-500">Total Rows</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">{result.successful}</p>
                    <p className="text-sm text-green-600">Imported</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-amber-700">{result.warnings}</p>
                    <p className="text-sm text-amber-600">Warnings</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                    <p className="text-sm text-red-600">Failed</p>
                  </div>
                </div>

                {result.warnings_list.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-700 mb-2 flex items-center gap-2">
                      <AlertTriangleIcon />
                      Warnings
                    </h4>
                    <ul className="space-y-1 text-sm text-amber-600">
                      {result.warnings_list.map((w, i) => (
                        <li key={i}>
                          Row {w.row}: {w.field} - {w.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                      <XCircleIcon />
                      Errors
                    </h4>
                    <ul className="space-y-1 text-sm text-red-600">
                      {result.errors.map((e, i) => (
                        <li key={i}>
                          Row {e.row}: {e.field} - {e.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {status === 'idle' && (
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                >
                  Start Import
                </button>
              )}
              {status === 'complete' && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <RefreshIcon />
                  Import Another File
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Field Mapping Reference */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Mapping</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Field</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Required</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Format</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Example</th>
              </tr>
            </thead>
            <tbody>
              {[
                { field: 'firstName', label: 'First Name', required: true, format: 'Text', example: 'Yael' },
                { field: 'lastName', label: 'Last Name', required: true, format: 'Text', example: 'Cohen' },
                { field: 'email', label: 'Email', required: true, format: 'Email', example: 'yael@example.com' },
                { field: 'phone', label: 'Phone', required: false, format: 'Israeli phone', example: '052-1234567' },
                { field: 'licenseNumber', label: 'License Number', required: true, format: 'Text', example: 'PSY-12345' },
                { field: 'city', label: 'City', required: true, format: 'Text', example: 'Tel Aviv' },
                { field: 'specializations', label: 'Specializations', required: false, format: 'Comma separated', example: 'Anxiety,Depression' },
                { field: 'approaches', label: 'Therapy Approaches', required: false, format: 'Comma separated', example: 'CBT,DBT' },
                { field: 'healthFunds', label: 'Health Funds', required: false, format: 'Comma separated', example: 'Clalit,Maccabi' },
                { field: 'sessionPrice', label: 'Session Price', required: false, format: 'Number', example: '400' },
                { field: 'yearsOfExperience', label: 'Years of Experience', required: false, format: 'Number', example: '5' },
              ].map((row) => (
                <tr key={row.field} className="border-b border-gray-100">
                  <td className="px-4 py-2">
                    <span className="font-mono text-amber-600 text-xs">{row.field}</span>
                    <span className="text-gray-400 text-xs ml-1">({row.label})</span>
                  </td>
                  <td className="px-4 py-2">
                    {row.required ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{row.format}</td>
                  <td className="px-4 py-2 text-gray-500">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Future Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Health Fund Integration</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {['Clalit', 'Maccabi', 'Meuhedet', 'Leumit'].map((fund) => (
                <li key={fund} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  {fund} - Coming soon
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">API Integrations</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {['REST API for Languages', 'Webhook Notifications', 'Scheduled Sync'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
