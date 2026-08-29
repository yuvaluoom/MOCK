'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

// Icons
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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-400">
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
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importSource, setImportSource] = useState<string>('csv');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setFile(selectedFile);
    setStatus('idle');
    setResult(null);

    // Parse and preview file (mock for now)
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

    // Simulate validation
    await new Promise((r) => setTimeout(r, 1000));
    setProgress(25);

    setStatus('importing');

    // Simulate import progress
    for (let i = 25; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 200));
      setProgress(i);
    }

    // Mock result
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

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'therapist_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Import Therapists</h1>
          <p className="text-slate-400 mt-1">
            Bulk import therapists from CSV or Excel files
          </p>
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <DownloadIcon />
          Download Template
        </Button>
      </div>

      {/* Import Source Selection */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Import Source</h2>
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
              className={`p-4 rounded-lg border-2 text-right transition-colors ${
                importSource === source.id
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <p className="font-medium text-white">{source.label}</p>
              <p className="text-sm text-slate-400 mt-1">{source.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">File Upload</h2>

        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-amber-500 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon />
              <p className="mb-2 text-sm text-slate-400 mt-4">
                <span className="font-semibold text-amber-400">Click to upload</span> or drag and drop a file here
              </p>
              <p className="text-xs text-slate-500">CSV or Excel file (up to 10MB)</p>
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
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <FileSpreadsheetIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB • {previewData.length} rows detected
                  </p>
                </div>
              </div>
              {status === 'idle' && (
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Preview Table */}
            {previewData.length > 0 && status === 'idle' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="px-4 py-2 text-right text-slate-400 font-medium">First Name</th>
                      <th className="px-4 py-2 text-right text-slate-400 font-medium">Last Name</th>
                      <th className="px-4 py-2 text-right text-slate-400 font-medium">Email</th>
                      <th className="px-4 py-2 text-right text-slate-400 font-medium">License</th>
                      <th className="px-4 py-2 text-right text-slate-400 font-medium">City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-slate-700/50">
                        <td className="px-4 py-2 text-white">{row.firstName}</td>
                        <td className="px-4 py-2 text-white">{row.lastName}</td>
                        <td className="px-4 py-2 text-slate-300">{row.email}</td>
                        <td className="px-4 py-2 text-slate-300">{row.licenseNumber}</td>
                        <td className="px-4 py-2 text-slate-300">{row.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <p className="text-sm text-slate-400 mt-2 px-4">
                    ... and {previewData.length - 5} more rows
                  </p>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {(status === 'validating' || status === 'importing') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {status === 'validating' ? 'Validating data...' : 'Importing therapists...'}
                  </span>
                  <span className="text-white">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
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
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{result.total}</p>
                    <p className="text-sm text-slate-400">Total Rows</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{result.successful}</p>
                    <p className="text-sm text-green-400/80">Imported Successfully</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{result.warnings}</p>
                    <p className="text-sm text-amber-400/80">Warnings</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">{result.failed}</p>
                    <p className="text-sm text-red-400/80">Failed</p>
                  </div>
                </div>

                {/* Warnings List */}
                {result.warnings_list.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <h4 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
                      <AlertTriangleIcon />
                      Warnings
                    </h4>
                    <ul className="space-y-1 text-sm text-amber-300">
                      {result.warnings_list.map((w, i) => (
                        <li key={i}>
                          Row {w.row}: {w.field} - {w.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Errors List */}
                {result.errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                      <XCircleIcon />
                      Errors
                    </h4>
                    <ul className="space-y-1 text-sm text-red-300">
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
                <Button
                  onClick={handleImport}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Start Import
                </Button>
              )}
              {status === 'complete' && (
                <Button
                  onClick={handleReset}
                  className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                  variant="outline"
                >
                  <RefreshIcon />
                  Import Another File
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Field Mapping Reference */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Field Mapping</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="px-4 py-2 text-right text-slate-400 font-medium">Field</th>
                <th className="px-4 py-2 text-right text-slate-400 font-medium">Required</th>
                <th className="px-4 py-2 text-right text-slate-400 font-medium">Format</th>
                <th className="px-4 py-2 text-right text-slate-400 font-medium">Example</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                { field: 'firstName', label: 'First Name', required: true, format: 'Text', example: 'Yael' },
                { field: 'lastName', label: 'Last Name', required: true, format: 'Text', example: 'Cohen' },
                { field: 'email', label: 'Email', required: true, format: 'Email', example: 'yael@example.com' },
                { field: 'phone', label: 'Phone', required: false, format: 'Israeli phone', example: '052-1234567' },
                { field: 'licenseNumber', label: 'License Number', required: true, format: 'Text', example: 'PSY-12345' },
                { field: 'city', label: 'City', required: true, format: 'Text', example: 'Tel Aviv' },
                { field: 'specializations', label: 'Specializations', required: false, format: 'Comma separated', example: 'Anxiety,Depression' },
                { field: 'approaches', label: 'Therapy Approaches', required: false, format: 'Comma separated', example: 'CBT,DBT' },
                { field: 'healthFunds', label: 'Health Funds', required: false, format: 'comma separated', example: 'Clalit,Maccabi' },
                { field: 'sessionPrice', label: 'Session Price', required: false, format: 'Number', example: '400' },
                { field: 'yearsOfExperience', label: 'Years of Experience', required: false, format: 'Number', example: '5' },
              ].map((row) => (
                <tr key={row.field} className="border-b border-slate-700/50">
                  <td className="px-4 py-2">
                    <span className="font-mono text-amber-400">{row.field}</span>
                    <span className="text-slate-500 text-xs mr-2">({row.label})</span>
                  </td>
                  <td className="px-4 py-2">
                    {row.required ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-slate-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{row.format}</td>
                  <td className="px-4 py-2">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Info */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Future Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-slate-300">Health Fund Integration</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Clalit - Coming soon
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Maccabi - Coming soon
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Meuhedet - Coming soon
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Leumit - Coming soon
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-slate-300">API Integrations</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                REST API for Languages
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Webhook Notifications
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Scheduled Sync
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
