'use client';

import { useState, useRef, useCallback } from 'react';
import type { DocumentCategory } from '@/lib/storage/types';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  DOCUMENT_TYPE_LABELS,
} from '@/lib/storage/types';

interface DocumentUploaderProps {
  category: DocumentCategory;
  documentType: string;
  therapistId?: string;
  patientId?: string;
  sessionId?: string;
  onUploadComplete: (result: {
    id: string;
    fileName: string;
    status: string;
  }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  expiresAt?: string;
}

export function DocumentUploader({
  category,
  documentType,
  therapistId,
  patientId,
  sessionId,
  onUploadComplete,
  onError,
  disabled = false,
  expiresAt,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ALLOWED_MIME_TYPES[category] ?? [];
  const maxSize = MAX_FILE_SIZE[category] ?? 10 * 1024 * 1024;
  const label = DOCUMENT_TYPE_LABELS[documentType] ?? documentType;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleError = useCallback((msg: string) => {
    setError(msg);
    onError?.(msg);
  }, [onError]);

  const processFile = useCallback(async (file: File) => {
    setError(null);

    if (!allowedTypes.includes(file.type)) {
      handleError(`File type not allowed. Accepted: PDF, JPEG, PNG`);
      return;
    }

    if (file.size > maxSize) {
      handleError(`File too large. Maximum: ${formatBytes(maxSize)}`);
      return;
    }

    setIsUploading(true);
    setProgress(10);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setProgress(40);

      const res = await fetch('/api/trpc/documents.upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileContent: base64,
            category,
            documentType,
            therapistId,
            patientId,
            sessionId,
            expiresAt,
          },
        }),
      });

      setProgress(80);

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error.message ?? 'Upload failed');
      }

      setProgress(100);

      const result = data.result?.data?.json ?? data.result?.data ?? data.result;
      onUploadComplete({
        id: result.id,
        fileName: result.fileName ?? file.name,
        status: result.status ?? 'PENDING_REVIEW',
      });
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [allowedTypes, maxSize, category, documentType, therapistId, patientId, sessionId, expiresAt, onUploadComplete, handleError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [disabled, isUploading, processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [processFile]);

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${isDragging ? 'border-calm-500 bg-calm-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="space-y-3">
            <div className="animate-spin mx-auto w-8 h-8 border-3 border-calm-200 border-t-calm-600 rounded-full" />
            <p className="text-sm text-gray-600">Encrypting and uploading...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
              <div
                className="bg-calm-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <svg className="mx-auto w-10 h-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-500 mt-1">
              Drag & drop or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, JPEG, PNG &bull; Max {formatBytes(maxSize)}
            </p>
          </>
        )}

        {/* Security badge */}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            AES-256
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
