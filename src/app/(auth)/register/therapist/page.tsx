'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/cn';
import { ProfilePhotoUpload } from '@/components/therapist/ProfilePhotoUpload';
import { CropData } from '@/components/ui/image-cropper';

// Icons
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 text-calm-600"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Document types for upload
type DocumentType = 'license' | 'degree' | 'certification' | 'insurance' | 'photo';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: DocumentType;
  file: File;
}

// Step type for multi-step form
type Step = 'personal' | 'documents' | 'review';

export default function TherapistRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    password: '',
    confirmPassword: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<{ blob: Blob | null; cropData: CropData | null }>({
    blob: null,
    cropData: null,
  });

  // Handle profile photo change
  const handleProfilePhotoChange = useCallback((blob: Blob | null, cropData: CropData | null) => {
    setProfilePhoto({ blob, cropData });
  }, []);

  const registerMutation = trpc.auth.registerTherapist.useMutation({
    onSuccess: () => {
      router.push('/therapist/pending-approval');
    },
    onError: (error) => {
      setErrors({ general: error.message || 'An error occurred during registration. Please try again.' });
    },
  });

  // Validate step 1 - Personal info
  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'שם פרטי נדרש';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'שם משפחה נדרש';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'אימייל נדרש';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'נא להזין כתובת אימייל תקינה';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'מספר טלפון נדרש';
    } else if (!/^0[0-9]{8,9}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'נא להזין מספר טלפון ישראלי תקין';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'מספר רישיון נדרש';
    }

    if (!formData.password) {
      newErrors.password = 'סיסמה נדרשת';
    } else if (formData.password.length < 8) {
      newErrors.password = 'הסיסמה חייבת להכיל לפחות 8 תווים';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2 - Documents
  const validateDocuments = () => {
    const newErrors: Record<string, string> = {};

    const hasLicense = uploadedFiles.some(f => f.type === 'license');
    if (!hasLicense) {
      newErrors.documents = 'נא להעלות העתק רישיון';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // File upload handler
  const handleFileUpload = useCallback((files: FileList | null, docType: DocumentType) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, fileType: 'קבצים מסוג PDF, JPG או PNG בלבד' }));
        continue;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, fileSize: 'גודל קובץ מקסימלי: 10MB' }));
        continue;
      }

      newFiles.push({
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: docType,
        file,
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setErrors(prev => {
      const next = { ...prev };
      delete next.documents;
      delete next.fileType;
      delete next.fileSize;
      return next;
    });
  }, []);

  // Remove file handler
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Navigate between steps
  const goToNextStep = () => {
    if (currentStep === 'personal') {
      if (validatePersonalInfo()) {
        setCurrentStep('documents');
      }
    } else if (currentStep === 'documents') {
      if (validateDocuments()) {
        setCurrentStep('review');
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'documents') {
      setCurrentStep('personal');
    } else if (currentStep === 'review') {
      setCurrentStep('documents');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePersonalInfo() || !validateDocuments()) {
      return;
    }

    // In production, upload files first, then register
    // For now, we just register without actual file upload
    registerMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Document type labels
  const documentLabels: Record<DocumentType, string> = {
    license: 'רישיון מקצועי',
    degree: 'תעודת תואר',
    certification: 'תעודות והסמכות',
    insurance: 'ביטוח אחריות מקצועית',
    photo: 'תמונת פרופיל',
  };

  // Step indicators
  const steps = [
    { id: 'personal', label: 'פרטים אישיים' },
    { id: 'documents', label: 'העלאת מסמכים' },
    { id: 'review', label: 'סיכום ושליחה' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-calm-500 to-trust-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="text-xl font-bold text-gray-900">MatchMind</span>
        </Link>
        <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          הרשמת מטפל
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">הצטרף כמטפל</CardTitle>
              <CardDescription>
                הצטרף לקהילת המטפלים שלנו וקבל מטופלים מותאמים
              </CardDescription>

              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                        idx < currentStepIndex
                          ? 'bg-green-500 text-white'
                          : idx === currentStepIndex
                          ? 'bg-calm-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {idx < currentStepIndex ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-12 h-1 mx-1 rounded-full transition-colors',
                          idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">{steps[currentStepIndex].label}</p>
            </CardHeader>
            <CardContent>
              {errors.general && (
                <div
                  className="p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4"
                  role="alert"
                >
                  {errors.general}
                </div>
              )}

              {/* Step 1: Personal Info */}
              {currentStep === 'personal' && (
                <form onSubmit={(e) => { e.preventDefault(); goToNextStep(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">שם פרטי</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="ישראל"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={!!errors.firstName}
                        required
                        autoComplete="given-name"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">שם משפחה</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="ישראלי"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={!!errors.lastName}
                        required
                        autoComplete="family-name"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">אימייל</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      required
                      autoComplete="email"
                      dir="ltr"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">מספר טלפון</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="050-1234567"
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      required
                      autoComplete="tel"
                      dir="ltr"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">מספר רישיון</Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      placeholder="מספר רישיון מקצועי"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      error={!!errors.licenseNumber}
                      required
                    />
                    {errors.licenseNumber && (
                      <p className="text-sm text-destructive">{errors.licenseNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">סיסמה</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      required
                      autoComplete="new-password"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      required
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" variant="calm" className="w-full">
                    המשך להעלאת מסמכים
                  </Button>
                </form>
              )}

              {/* Step 2: Document Upload */}
              {currentStep === 'documents' && (
                <div className="space-y-6">
                  {/* Profile Photo Section */}
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-calm-50 to-trust-50">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">תמונת פרופיל</h4>
                    <ProfilePhotoUpload
                      currentPhotoUrl={null}
                      onPhotoChange={handleProfilePhotoChange}
                      name={`${formData.firstName} ${formData.lastName}`}
                      size="xl"
                      language="he"
                    />
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      העלה את המסמכים הבאים לצורך אימות הרישיון שלך. קבצים מסוג PDF, JPG או PNG עד 10MB.
                    </p>

                    {errors.documents && (
                      <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                        {errors.documents}
                      </div>
                    )}

                    {/* Document upload sections (excluding photo, which is now separate) */}
                    {(['license', 'degree', 'certification', 'insurance'] as DocumentType[]).map((docType) => {
                      const filesOfType = uploadedFiles.filter(f => f.type === docType);
                      const isRequired = docType === 'license';

                      return (
                        <div key={docType} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {documentLabels[docType]}
                                {isRequired && <span className="text-red-500 mr-1">*</span>}
                              </h4>
                              <p className="text-xs text-gray-500">PDF, JPG או PNG</p>
                            </div>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(e.target.files, docType)}
                                multiple
                              />
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-calm-600 bg-calm-50 rounded-lg hover:bg-calm-100 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                העלה
                              </span>
                            </label>
                          </div>

                          {/* Uploaded files list */}
                          {filesOfType.length > 0 && (
                            <ul className="space-y-2">
                              {filesOfType.map((file) => (
                                <li
                                  key={file.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileIcon />
                                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                    <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(file.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="הסר קובץ"
                                  >
                                    <XIcon />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={goToPreviousStep} className="flex-1">
                      חזור
                    </Button>
                    <Button type="button" variant="calm" onClick={goToNextStep} className="flex-1">
                      המשך לסיכום
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">פרטים אישיים</h4>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <dt className="text-gray-500">שם:</dt>
                        <dd className="text-gray-900">{formData.firstName} {formData.lastName}</dd>
                        <dt className="text-gray-500">אימייל:</dt>
                        <dd className="text-gray-900" dir="ltr">{formData.email}</dd>
                        <dt className="text-gray-500">טלפון:</dt>
                        <dd className="text-gray-900" dir="ltr">{formData.phone}</dd>
                        <dt className="text-gray-500">מספר רישיון:</dt>
                        <dd className="text-gray-900">{formData.licenseNumber}</dd>
                      </dl>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">מסמכים שהועלו</h4>
                      {uploadedFiles.length === 0 ? (
                        <p className="text-sm text-gray-500">לא הועלו מסמכים</p>
                      ) : (
                        <ul className="space-y-1 text-sm">
                          {uploadedFiles.map((file) => (
                            <li key={file.id} className="flex items-center gap-2 text-gray-700">
                              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {documentLabels[file.type]}: {file.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-amber-800">תהליך אישור</p>
                          <p className="text-xs text-amber-600 mt-1">
                            לאחר השליחה, צוות MatchMind יבדוק את המסמכים שלך. תהליך האישור עשוי לקחת 1-3 ימי עסקים.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={goToPreviousStep} className="flex-1">
                      חזור
                    </Button>
                    <Button
                      type="button"
                      variant="calm"
                      onClick={handleSubmit}
                      loading={registerMutation.isPending}
                      className="flex-1"
                    >
                      שלח לאישור
                    </Button>
                  </div>
                </div>
              )}

              {/* Login Link */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                כבר יש לך חשבון?{' '}
                <Link
                  href="/login/therapist"
                  className="text-primary hover:underline font-medium"
                >
                  התחבר
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
        <p>
          בהרשמה, אתה מסכים ל
          <Link href="/terms" className="underline mx-1">
            תנאי השימוש
          </Link>
          ול
          <Link href="/privacy" className="underline mx-1">
            מדיניות הפרטיות
          </Link>
        </p>
      </footer>
    </div>
  );
}
