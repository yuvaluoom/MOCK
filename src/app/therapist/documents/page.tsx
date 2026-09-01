'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import {
  DOCUMENT_TYPE_LABELS,
  STATUS_LABELS,
  type DocumentCategory,
} from '@/lib/storage/types';

type CredentialType = 'LICENSE' | 'DIPLOMA' | 'CERTIFICATION' | 'INSURANCE' | 'SUPERVISION' | 'CONTINUING_ED';

const REQUIRED_CREDENTIALS: { type: CredentialType; description: string }[] = [
  { type: 'LICENSE', description: 'Valid practice license issued by the Israeli Ministry of Health' },
  { type: 'DIPLOMA', description: 'Academic diploma from an accredited institution' },
  { type: 'INSURANCE', description: 'Professional liability insurance certificate' },
];

const OPTIONAL_CREDENTIALS: { type: CredentialType; description: string }[] = [
  { type: 'CERTIFICATION', description: 'Professional certifications (CBT, EMDR, etc.)' },
  { type: 'SUPERVISION', description: 'Supervision completion certificate' },
  { type: 'CONTINUING_ED', description: 'Continuing education certificates' },
];

const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
  PENDING_REVIEW: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: '⏳' },
  APPROVED: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: '✓' },
  REJECTED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: '✗' },
  REQUIRES_UPDATE: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: '↻' },
  EXPIRED: { bg: 'bg-gray-100 border-gray-300', text: 'text-gray-600', icon: '⧖' },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TherapistDocumentsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'credentials' | 'clinical' | 'consent'>('credentials');

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const { data: documents, refetch } = trpc.documents.listMyDocuments.useQuery();

  const credentialDocs = documents?.filter(d => d.category === 'CREDENTIAL') ?? [];
  const clinicalDocs = documents?.filter(d => d.category === 'CLINICAL') ?? [];
  const consentDocs = documents?.filter(d => d.category === 'CONSENT') ?? [];

  const getDocForType = (type: string) => credentialDocs.find(d => d.documentType === type);
  const approvedCount = credentialDocs.filter(d => d.status === 'APPROVED').length;
  const totalRequired = REQUIRED_CREDENTIALS.length;
  const completionPct = totalRequired > 0 ? Math.round((approvedCount / totalRequired) * 100) : 0;

  const handleUploadComplete = (result: { id: string; fileName: string; status: string }) => {
    showToast(`${result.fileName} uploaded successfully`);
    setShowUploader(null);
    refetch();
  };

  const tabs = [
    { id: 'credentials' as const, label: 'Credentials', count: credentialDocs.length },
    { id: 'clinical' as const, label: 'Clinical Files', count: clinicalDocs.length },
    { id: 'consent' as const, label: 'Consent Forms', count: consentDocs.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600 mt-1">Upload and manage your professional documents securely</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-gray-600">End-to-end encrypted</span>
        </div>
      </div>

      {/* Security Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Document Security Protocol</p>
            <p className="mt-1">
              All documents are encrypted with AES-256 at rest and in transit. Access is logged and audited.
              Documents are retained per Israeli health record regulations (7 years).
              Only authorized administrators can view your credential documents for verification.
            </p>
          </div>
        </div>
      </div>

      {/* Completion Progress (for credentials) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Credential Verification Progress</h3>
            <span className="text-sm font-medium text-gray-600">{approvedCount}/{totalRequired} approved</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${completionPct === 100 ? 'bg-green-500' : 'bg-calm-500'}`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
          {completionPct < 100 && (
            <p className="text-xs text-gray-500 mt-2">
              Upload all required credentials to complete your verification
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
          <div className="grid gap-4">
            {REQUIRED_CREDENTIALS.map(cred => {
              const doc = getDocForType(cred.type);
              const status = doc ? statusConfig[doc.status] : null;

              return (
                <Card key={cred.type} className={doc ? '' : 'border-dashed'}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {DOCUMENT_TYPE_LABELS[cred.type]}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600 border border-red-200">
                            Required
                          </span>
                          {doc && status && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.text}`}>
                              {status.icon} {STATUS_LABELS[doc.status as keyof typeof STATUS_LABELS] ?? doc.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{cred.description}</p>
                        {doc && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>{doc.fileName}</span>
                            <span>{formatBytes(doc.fileSize)}</span>
                            <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-US')}</span>
                            {doc.expiresAt && (
                              <span className={new Date(doc.expiresAt) < new Date() ? 'text-red-600 font-medium' : ''}>
                                Expires {new Date(doc.expiresAt).toLocaleDateString('en-US')}
                              </span>
                            )}
                          </div>
                        )}
                        {doc?.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-700">
                            <span className="font-medium">Reason: </span>{doc.rejectionReason}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {(!doc || doc.status === 'REJECTED' || doc.status === 'REQUIRES_UPDATE' || doc.status === 'EXPIRED') && (
                          <Button
                            variant="calm"
                            size="sm"
                            onClick={() => setShowUploader(showUploader === cred.type ? null : cred.type)}
                          >
                            {doc ? 'Re-upload' : 'Upload'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {showUploader === cred.type && (
                      <div className="mt-4 border-t pt-4">
                        <DocumentUploader
                          category="CREDENTIAL"
                          documentType={cred.type}
                          onUploadComplete={handleUploadComplete}
                          onError={(err) => showToast(err)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-8">Optional Documents</h3>
          <div className="grid gap-4">
            {OPTIONAL_CREDENTIALS.map(cred => {
              const doc = getDocForType(cred.type);
              const status = doc ? statusConfig[doc.status] : null;

              return (
                <Card key={cred.type} className={doc ? '' : 'border-dashed'}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {DOCUMENT_TYPE_LABELS[cred.type]}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200">
                            Optional
                          </span>
                          {doc && status && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.text}`}>
                              {status.icon} {STATUS_LABELS[doc.status as keyof typeof STATUS_LABELS] ?? doc.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{cred.description}</p>
                        {doc && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>{doc.fileName}</span>
                            <span>{formatBytes(doc.fileSize)}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUploader(showUploader === cred.type ? null : cred.type)}
                      >
                        {doc ? 'Replace' : 'Upload'}
                      </Button>
                    </div>

                    {showUploader === cred.type && (
                      <div className="mt-4 border-t pt-4">
                        <DocumentUploader
                          category="CREDENTIAL"
                          documentType={cred.type}
                          onUploadComplete={handleUploadComplete}
                          onError={(err) => showToast(err)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Clinical Files Tab */}
      {activeTab === 'clinical' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Clinical Documents</h3>
            <Button
              variant="calm"
              size="sm"
              onClick={() => setShowUploader(showUploader === 'CLINICAL' ? null : 'CLINICAL')}
            >
              Upload Clinical Document
            </Button>
          </div>

          {showUploader === 'CLINICAL' && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {['SESSION_NOTES', 'ASSESSMENT', 'TREATMENT_PLAN', 'REFERRAL'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setShowUploader(`CLINICAL_${type}`)}
                      className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                        showUploader === `CLINICAL_${type}`
                          ? 'border-calm-500 bg-calm-50 text-calm-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {DOCUMENT_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
                {showUploader?.startsWith('CLINICAL_') && (
                  <DocumentUploader
                    category="CLINICAL"
                    documentType={showUploader.replace('CLINICAL_', '')}
                    onUploadComplete={handleUploadComplete}
                    onError={(err) => showToast(err)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {clinicalDocs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No clinical documents uploaded yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload scanned session notes, assessments, or treatment plans</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {clinicalDocs.map(doc => {
                const status = statusConfig[doc.status];
                return (
                  <Card key={doc.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType} &bull; {formatBytes(doc.fileSize)} &bull; {new Date(doc.uploadedAt).toLocaleDateString('en-US')}
                            </p>
                          </div>
                        </div>
                        {status && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.text}`}>
                            {status.icon} {STATUS_LABELS[doc.status as keyof typeof STATUS_LABELS]}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Consent Forms Tab */}
      {activeTab === 'consent' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Consent Forms</h3>
            <Button
              variant="calm"
              size="sm"
              onClick={() => setShowUploader(showUploader === 'CONSENT' ? null : 'CONSENT')}
            >
              Upload Consent Form
            </Button>
          </div>

          {showUploader === 'CONSENT' && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {['INFORMED_CONSENT', 'PRIVACY_CONSENT', 'RECORDING_CONSENT'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setShowUploader(`CONSENT_${type}`)}
                      className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                        showUploader === `CONSENT_${type}`
                          ? 'border-calm-500 bg-calm-50 text-calm-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {DOCUMENT_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
                {showUploader?.startsWith('CONSENT_') && (
                  <DocumentUploader
                    category="CONSENT"
                    documentType={showUploader.replace('CONSENT_', '')}
                    onUploadComplete={handleUploadComplete}
                    onError={(err) => showToast(err)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {consentDocs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-gray-500">No consent forms uploaded yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload signed patient consent forms for secure storage</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {consentDocs.map(doc => {
                const status = statusConfig[doc.status];
                return (
                  <Card key={doc.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType} &bull; {formatBytes(doc.fileSize)}
                            </p>
                          </div>
                        </div>
                        {status && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.text}`}>
                            {status.icon} {STATUS_LABELS[doc.status as keyof typeof STATUS_LABELS]}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
