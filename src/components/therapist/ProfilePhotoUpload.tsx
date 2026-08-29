'use client';

import { useState, useCallback } from 'react';
import { ImageCropper, AvatarDisplay, CropData } from '@/components/ui/image-cropper';
import { Button } from '@/components/ui/button';

// Icons
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoChange: (photoBlob: Blob | null, cropData: CropData | null) => void;
  name: string;
  size?: 'md' | 'lg' | 'xl';
  language?: 'he' | 'en';
  disabled?: boolean;
}

const labels = {
  he: {
    addPhoto: 'Add Photo',
    changePhoto: 'Change Photo',
    removePhoto: 'Remove Photo',
    photoGuide: 'A clear photo of your face helps patients feel more comfortable',
  },
  en: {
    addPhoto: 'Add Photo',
    changePhoto: 'Change Photo',
    removePhoto: 'Remove Photo',
    photoGuide: 'A clear photo of your face helps patients feel more comfortable',
  },
};

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoChange,
  name,
  size = 'lg',
  language = 'he',
  disabled = false,
}: ProfilePhotoUploadProps) {
  const [showCropper, setShowCropper] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);

  const text = labels[language];

  const handleCropComplete = useCallback((blob: Blob, cropData: CropData) => {
    // Create preview URL
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowCropper(false);
    onPhotoChange(blob, cropData);
  }, [onPhotoChange]);

  const handleRemovePhoto = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onPhotoChange(null, null);
  }, [previewUrl, onPhotoChange]);

  const handleCancel = useCallback(() => {
    setShowCropper(false);
  }, []);

  if (showCropper) {
    return (
      <div className="w-full max-w-md mx-auto">
        <ImageCropper
          onCropComplete={handleCropComplete}
          onCancel={handleCancel}
          currentImage={previewUrl || undefined}
          aspectRatio={1}
          circularCrop={true}
          language={language}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Avatar Display */}
      <div className="relative group">
        <AvatarDisplay
          src={previewUrl}
          name={name}
          size={size}
          className="border-4 border-white shadow-lg"
        />

        {/* Overlay on hover */}
        {!disabled && (
          <button
            type="button"
            onClick={() => setShowCropper(true)}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <CameraIcon />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      {!disabled && (
        <div className="flex items-center gap-2">
          {previewUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCropper(true)}
                className="gap-1"
              >
                <EditIcon />
                {text.changePhoto}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon />
                {text.removePhoto}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCropper(true)}
              className="gap-1"
            >
              <CameraIcon />
              {text.addPhoto}
            </Button>
          )}
        </div>
      )}

      {/* Guide text */}
      {!previewUrl && !disabled && (
        <p className="text-sm text-gray-500 text-center max-w-xs">
          {text.photoGuide}
        </p>
      )}
    </div>
  );
}
