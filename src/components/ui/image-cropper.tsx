'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';

// Icons
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const CropIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 2v14a2 2 0 0 0 2 2h14" />
    <path d="M18 22V8a2 2 0 0 0-2-2H2" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

interface ImageCropperProps {
  onCropComplete: (croppedImageBlob: Blob, cropData: CropData) => void;
  onCancel?: () => void;
  currentImage?: string;
  aspectRatio?: number;
  circularCrop?: boolean;
  maxSizeMB?: number;
  language?: 'he' | 'en';
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

const labels = {
  he: {
    upload: 'Upload Image',
    dragDrop: 'Drag an image here or',
    clickToUpload: 'click to choose',
    supportedFormats: 'JPG, PNG - up to 5MB',
    cropTitle: 'Crop Image',
    cropInstructions: 'Drag the frame to select the desired area',
    save: 'Save',
    cancel: 'Cancel',
    change: 'Change Image',
    fileTooLarge: 'File is too large. Maximum size: 5MB',
    invalidFormat: 'Unsupported format. Use JPG or PNG',
  },
  en: {
    upload: 'Upload Image',
    dragDrop: 'Drag and drop an image or',
    clickToUpload: 'click to select',
    supportedFormats: 'JPG, PNG - up to 5MB',
    cropTitle: 'Crop Image',
    cropInstructions: 'Drag the frame to select the area',
    save: 'Save',
    cancel: 'Cancel',
    change: 'Change Image',
    fileTooLarge: 'File is too large. Maximum size: 5MB',
    invalidFormat: 'Invalid format. Use JPG or PNG',
  },
};

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({
  onCropComplete,
  onCancel,
  currentImage,
  aspectRatio = 1,
  circularCrop = true,
  maxSizeMB = 5,
  language = 'he',
}: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string>(currentImage || '');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const text = labels[language];

  const handleFileSelect = useCallback((file: File) => {
    setError('');

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      setError(text.invalidFormat);
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(text.fileTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [maxSizeMB, text]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to desired output (300x300 for profile photos)
    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // For circular crop, clip to circle
    if (circularCrop) {
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.9
      );
    });
  }, [completedCrop, circularCrop]);

  const handleSave = async () => {
    if (!completedCrop) return;

    setIsProcessing(true);
    try {
      const blob = await getCroppedImage();
      if (blob) {
        const cropData: CropData = {
          x: completedCrop.x,
          y: completedCrop.y,
          width: completedCrop.width,
          height: completedCrop.height,
        };
        onCropComplete(blob, cropData);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (onCancel) {
      onCancel();
    }
  };

  // Upload area (no image selected)
  if (!imageSrc) {
    return (
      <div className="w-full" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-calm-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-calm-50 flex items-center justify-center text-calm-600">
              <UploadIcon />
            </div>
            <div>
              <p className="text-gray-700 font-medium">{text.dragDrop}</p>
              <p className="text-calm-600 font-medium">{text.clickToUpload}</p>
            </div>
            <p className="text-sm text-gray-500">{text.supportedFormats}</p>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    );
  }

  // Cropping interface
  return (
    <div className="w-full" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
          <CropIcon />
          <span className="font-medium text-gray-900">{text.cropTitle}</span>
        </div>

        {/* Crop area */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3 text-center">{text.cropInstructions}</p>
          <div className="flex justify-center bg-gray-100 rounded-lg p-4">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={circularCrop}
              className="max-h-80"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-80 object-contain"
              />
            </ReactCrop>
          </div>

          {/* Preview */}
          {completedCrop && (
            <div className="mt-4 flex justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Preview</p>
                <div
                  className="w-20 h-20 rounded-full overflow-hidden border-2 border-calm-200 mx-auto"
                  style={{
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: `${(imgRef.current?.width || 0) / (completedCrop.width / 80)}px`,
                    backgroundPosition: `-${(completedCrop.x / (completedCrop.width / 80))}px -${(completedCrop.y / (completedCrop.height / 80))}px`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t bg-gray-50 flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            <XIcon />
            <span className="mr-1">{text.cancel}</span>
          </Button>
          <Button
            type="button"
            variant="calm"
            onClick={handleSave}
            disabled={!completedCrop || isProcessing}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckIcon />
            )}
            <span className="mr-1">{text.save}</span>
          </Button>
        </div>
      </div>

      {/* Change image button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 text-sm text-calm-600 hover:text-calm-700 flex items-center gap-1 mx-auto"
      >
        <UploadIcon />
        {text.change}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}

/**
 * Circular avatar display component with fallback
 */
interface AvatarDisplayProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-32 h-32 text-4xl',
};

export function AvatarDisplay({ src, name, size = 'md', className = '' }: AvatarDisplayProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-calm-100 to-trust-100 flex items-center justify-center font-medium text-calm-700 ${className}`}
    >
      {initials}
    </div>
  );
}
