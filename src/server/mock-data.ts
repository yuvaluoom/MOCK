/**
 * Mock data store for development
 *
 * IMPORTANT: Therapist data is now sourced from mock-db.ts (single source of truth).
 * The `mockTherapists` export below is a live getter that reads from mock-db.
 * Any therapist created/updated in mock-db is immediately reflected here.
 *
 * In production, this will be replaced by Prisma database queries.
 */

import { mockDb } from '@/lib/database/mock-db';

export type UserRole = 'PATIENT' | 'THERAPIST' | 'ADMIN';

// ============ THERAPISTS ============

export interface MockTherapist {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  title: string;
  bio: string;
  bioHebrew: string;
  city: string;
  address: string;
  licenseNumber: string;
  photoUrl: string | null;
  photoThumbnailUrl: string | null;
  offersOnline: boolean;
  offersInPerson: boolean;
  languages: string[];
  approaches: string[];
  specializations: string[];
  acceptedHealthFunds: string[];
  sessionPrice: number;
  sessionDuration: number;
  yearsOfExperience: number;
  education?: string[];
  approvalStatus: string;
  approvalNote: string | null;
  approvedBy: string | null;
  profileCompleted: boolean;
  isAcceptingPatients: boolean;
  approvedAt: Date | null;
  createdAt: Date;
  // Matching metadata fields
  communicationStyles?: CommunicationStylePreference[];
  therapyStyles?: TherapyStylePreference[];
  emotionalFocus?: EmotionalNeed[];
  religiousAffiliation?: ReligiousAffiliation;
  militaryExperience?: boolean;
  treatsAgeGroups?: AgeGroup[];
}

/**
 * UNIFIED THERAPIST DATA — reads from mock-db (single source of truth).
 *
 * This getter function returns the live therapist list from mock-db.
 * Any therapist created, updated, or status-changed in mock-db is reflected here immediately.
 * All routers that import `mockTherapists` now get real-time data.
 */
function getTherapistsFromDb(): MockTherapist[] {
  return mockDb.getAllTherapists().map((t) => ({
    id: t.id,
    userId: t.userId,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.email,
    phone: t.phone,
    gender: t.gender,
    title: t.title,
    bio: t.bio,
    bioHebrew: t.bioHebrew,
    city: t.city,
    address: t.address,
    licenseNumber: t.licenseNumber,
    photoUrl: t.photoUrl,
    photoThumbnailUrl: t.photoThumbnailUrl,
    offersOnline: t.offersOnline,
    offersInPerson: t.offersInPerson,
    languages: t.languages,
    approaches: t.approaches,
    specializations: t.specializations,
    acceptedHealthFunds: t.acceptedHealthFunds,
    sessionPrice: t.sessionPrice,
    sessionDuration: t.sessionDuration,
    yearsOfExperience: t.yearsOfExperience,
    education: t.education,
    approvalStatus: t.approvalStatus,
    approvalNote: t.approvalNote,
    approvedBy: t.approvedBy,
    profileCompleted: t.profileCompleted,
    isAcceptingPatients: t.isAcceptingPatients,
    approvedAt: t.approvedAt,
    createdAt: t.createdAt,
    // Matching metadata
    communicationStyles: t.communicationStyles,
    therapyStyles: t.therapyStyles,
    emotionalFocus: t.emotionalFocus,
    religiousAffiliation: t.religiousAffiliation,
    militaryExperience: t.militaryExperience,
    treatsAgeGroups: t.treatsAgeGroups,
  }));
}

// Live proxy: every access reads the latest from mock-db
export const mockTherapists: MockTherapist[] = new Proxy([] as MockTherapist[], {
  get(target, prop, receiver) {
    const live = getTherapistsFromDb();
    if (prop === 'length') return live.length;
    if (typeof prop === 'string' && !isNaN(Number(prop))) return live[Number(prop)];
    if (prop === Symbol.iterator) return live[Symbol.iterator].bind(live);
    // Delegate array methods (find, filter, map, etc.) to the live data
    const val = (live as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === 'function') return (val as Function).bind(live);
    return Reflect.get(live, prop, receiver);
  },
});

// ============ PATIENTS ============

// Enums for objective/subjective data
export type MilitaryServiceType = 'NONE' | 'MANDATORY' | 'CAREER' | 'RESERVE';
export type ReligiousAffiliation = 'SECULAR' | 'TRADITIONAL' | 'RELIGIOUS' | 'ULTRA_ORTHODOX' | 'OTHER';
export type MaritalStatus = 'SINGLE' | 'IN_RELATIONSHIP' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type WorkStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED' | 'MILITARY_SERVICE';
export type EducationLevel = 'HIGH_SCHOOL' | 'SOME_COLLEGE' | 'BACHELORS' | 'MASTERS' | 'DOCTORATE' | 'OTHER';
export type CommunicationStylePreference = 'DIRECT' | 'GENTLE' | 'ANALYTICAL' | 'SPIRITUAL' | 'STRUCTURED';
export type EmotionalNeed = 'VALIDATION' | 'TOOLS' | 'EXPLORATION' | 'ACCOUNTABILITY';
export type TherapyStylePreference = 'DIRECTIVE' | 'EXPLORATORY' | 'STRUCTURED' | 'FLEXIBLE';
export type AgeGroup = 'CHILDREN' | 'ADOLESCENTS' | 'ADULTS' | 'ELDERLY';

export interface MockPatient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  healthFund: string;
  preferredOnline: boolean;
  preferredGender: string | null;
  preferredLanguages: string[];
  preferredApproaches: string[];
  preferredDays: string[];
  onboardingCompleted: boolean;
  questionnaireCompleted: boolean;
  createdAt: Date;
  // Objective demographic fields
  age?: number;
  dateOfBirth?: Date;
  gender?: string;
  maritalStatus?: MaritalStatus;
  hasChildren?: boolean;
  numberOfChildren?: number;
  militaryService?: MilitaryServiceType;
  religiousAffiliation?: ReligiousAffiliation;
  nativeLanguage?: string;
  workStatus?: WorkStatus;
  educationLevel?: EducationLevel;
}

export const mockPatient: MockPatient = {
  id: 'patient-1',
  userId: 'user-patient-1',
  firstName: 'ישראל',
  lastName: 'ישראלי',
  email: 'patient@example.com',
  phone: '050-1234567',
  city: 'תל אביב',
  healthFund: 'MACCABI',
  preferredOnline: true,
  preferredGender: null,
  preferredLanguages: ['he'],
  preferredApproaches: [],
  preferredDays: ['SUNDAY', 'TUESDAY', 'THURSDAY'],
  onboardingCompleted: true,
  questionnaireCompleted: true,
  createdAt: new Date('2024-05-01'),
  // Objective demographic data
  age: 34,
  dateOfBirth: new Date('1991-08-15'),
  gender: 'MALE',
  maritalStatus: 'MARRIED',
  hasChildren: true,
  numberOfChildren: 2,
  militaryService: 'MANDATORY',
  religiousAffiliation: 'SECULAR',
  nativeLanguage: 'he',
  workStatus: 'EMPLOYED',
  educationLevel: 'BACHELORS',
};

// ============ X-FACTOR PROFILE ============

export interface MockXFactorProfile {
  id: string;
  patientId: string;
  openness: number;
  emotionalIntensity: number;
  structurePreference: number;
  relationshipStyle: number;
  communicationStyle: number;
  changeReadiness: number;
  sleepQuality: number | null;
  stressLevel: number | null;
  militaryStress: number | null;
  emotionalLoad: number | null;
  version: number;
  calculatedAt: Date;
  // Subjective preference fields
  communicationStylePreference?: CommunicationStylePreference;
  emotionalNeeds?: EmotionalNeed[];
  therapyStylePreference?: TherapyStylePreference;
}

export const mockXFactorProfile: MockXFactorProfile = {
  id: 'xfactor-1',
  patientId: 'patient-1',
  openness: 72,
  emotionalIntensity: 58,
  structurePreference: 65,
  relationshipStyle: 70,
  communicationStyle: 55,
  changeReadiness: 80,
  sleepQuality: 45,
  stressLevel: 62,
  militaryStress: null,
  emotionalLoad: 55,
  version: 1,
  calculatedAt: new Date('2024-05-15'),
  // Subjective preferences
  communicationStylePreference: 'DIRECT',
  emotionalNeeds: ['TOOLS', 'ACCOUNTABILITY'],
  therapyStylePreference: 'STRUCTURED',
};

// ============ MATCHES ============

export interface MatchExplanationItem {
  category: 'objective' | 'subjective' | 'therapeutic' | 'practical';
  matched: boolean;
  labelHe: string;
  labelEn: string;
}

export interface MockMatch {
  id: string;
  patientId: string;
  therapistId: string;
  overallScore: number;
  xFactorScore: number;
  healthFundScore: number;
  availabilityScore: number;
  locationScore: number;
  preferenceScore: number;
  objectiveFitScore: number;
  subjectiveFitScore: number;
  scoreBreakdown: any;
  explanationHe: string;
  explanationEn: string;
  explanationItems: MatchExplanationItem[];
  isViewed: boolean;
  isFavorited: boolean;
  isHidden: boolean;
  createdAt: Date;
}

export const mockMatches: MockMatch[] = [
  {
    id: 'match-1',
    patientId: 'patient-1',
    therapistId: 'therapist-1',
    overallScore: 92,
    xFactorScore: 88,
    healthFundScore: 100,
    availabilityScore: 85,
    locationScore: 90,
    preferenceScore: 90,
    objectiveFitScore: 95,
    subjectiveFitScore: 90,
    scoreBreakdown: {
      xFactor: { score: 88, weight: 0.30 },
      healthFund: { score: 100, weight: 0.20 },
      availability: { score: 85, weight: 0.15 },
      preference: { score: 90, weight: 0.10 },
      objectiveFit: { score: 95, weight: 0.10 },
      subjectiveFit: { score: 90, weight: 0.15 },
    },
    explanationHe: 'התאמה טיפולית גבוהה מאוד - סגנון הטיפול מתאים לצרכים שלך • עובד/ת עם מכבי • מציע/ה טיפול מקוון • מתמחה בחרדה',
    explanationEn: 'Very high therapeutic compatibility • Works with Maccabi • Offers online therapy • Specializes in anxiety',
    explanationItems: [
      { category: 'practical', matched: true, labelHe: 'קופת חולים תואמת (מכבי)', labelEn: 'Health fund match (Maccabi)' },
      { category: 'practical', matched: true, labelHe: 'מציעה טיפול מקוון', labelEn: 'Offers online therapy' },
      { category: 'therapeutic', matched: true, labelHe: 'סגנון טיפולי CBT מתאים', labelEn: 'CBT therapy style match' },
      { category: 'subjective', matched: true, labelHe: 'סגנון תקשורת ישיר', labelEn: 'Direct communication style' },
      { category: 'subjective', matched: true, labelHe: 'מתמקדת בכלים ואחריותיות', labelEn: 'Focuses on tools & accountability' },
      { category: 'objective', matched: true, labelHe: 'מטפלת במבוגרים', labelEn: 'Treats adults' },
      { category: 'objective', matched: true, labelHe: 'רקע חילוני תואם', labelEn: 'Secular background match' },
    ],
    isViewed: true,
    isFavorited: true,
    isHidden: false,
    createdAt: new Date('2024-05-16'),
  },
  {
    id: 'match-2',
    patientId: 'patient-1',
    therapistId: 'therapist-4',
    overallScore: 85,
    xFactorScore: 82,
    healthFundScore: 100,
    availabilityScore: 75,
    locationScore: 85,
    preferenceScore: 85,
    objectiveFitScore: 80,
    subjectiveFitScore: 75,
    scoreBreakdown: {
      xFactor: { score: 82, weight: 0.30 },
      healthFund: { score: 100, weight: 0.20 },
      availability: { score: 75, weight: 0.15 },
      preference: { score: 85, weight: 0.10 },
      objectiveFit: { score: 80, weight: 0.10 },
      subjectiveFit: { score: 75, weight: 0.15 },
    },
    explanationHe: 'התאמה טיפולית גבוהה מאוד • עובד/ת עם מכבי • מתמחה ביחסים',
    explanationEn: 'Very high therapeutic compatibility • Works with Maccabi • Specializes in relationships',
    explanationItems: [
      { category: 'practical', matched: true, labelHe: 'קופת חולים תואמת (מכבי)', labelEn: 'Health fund match (Maccabi)' },
      { category: 'practical', matched: true, labelHe: 'מציע טיפול מקוון ופרונטלי', labelEn: 'Offers online & in-person' },
      { category: 'therapeutic', matched: true, labelHe: 'מתמחה ביחסים ומשפחה', labelEn: 'Specializes in relationships & family' },
      { category: 'subjective', matched: false, labelHe: 'סגנון תקשורת לא תואם במלואו', labelEn: 'Communication style partial match' },
      { category: 'objective', matched: true, labelHe: 'מטפל במבוגרים', labelEn: 'Treats adults' },
    ],
    isViewed: false,
    isFavorited: false,
    isHidden: false,
    createdAt: new Date('2024-05-16'),
  },
  {
    id: 'match-3',
    patientId: 'patient-1',
    therapistId: 'therapist-5',
    overallScore: 78,
    xFactorScore: 75,
    healthFundScore: 100,
    availabilityScore: 70,
    locationScore: 72,
    preferenceScore: 72,
    objectiveFitScore: 85,
    subjectiveFitScore: 80,
    scoreBreakdown: {
      xFactor: { score: 75, weight: 0.30 },
      healthFund: { score: 100, weight: 0.20 },
      availability: { score: 70, weight: 0.15 },
      preference: { score: 72, weight: 0.10 },
      objectiveFit: { score: 85, weight: 0.10 },
      subjectiveFit: { score: 80, weight: 0.15 },
    },
    explanationHe: 'התאמה טיפולית טובה • עובד/ת עם מכבי • מציע/ה טיפול מקוון • מתמחה בלחץ ומתח',
    explanationEn: 'Good therapeutic compatibility • Works with Maccabi • Offers online therapy • Specializes in stress',
    explanationItems: [
      { category: 'practical', matched: true, labelHe: 'קופת חולים תואמת (מכבי)', labelEn: 'Health fund match (Maccabi)' },
      { category: 'practical', matched: true, labelHe: 'מציעה טיפול מקוון', labelEn: 'Offers online therapy' },
      { category: 'therapeutic', matched: true, labelHe: 'מתמחה בלחץ ושינה', labelEn: 'Specializes in stress & sleep' },
      { category: 'subjective', matched: true, labelHe: 'סגנון מובנה תואם', labelEn: 'Structured style match' },
      { category: 'objective', matched: true, labelHe: 'רקע חילוני תואם', labelEn: 'Secular background match' },
      { category: 'objective', matched: false, labelHe: 'אין ניסיון צבאי', labelEn: 'No military experience' },
    ],
    isViewed: false,
    isFavorited: false,
    isHidden: false,
    createdAt: new Date('2024-05-16'),
  },
  {
    id: 'match-4',
    patientId: 'patient-1',
    therapistId: 'therapist-2',
    overallScore: 71,
    xFactorScore: 70,
    healthFundScore: 0,
    availabilityScore: 80,
    locationScore: 65,
    preferenceScore: 65,
    objectiveFitScore: 90,
    subjectiveFitScore: 70,
    scoreBreakdown: {
      xFactor: { score: 70, weight: 0.30 },
      healthFund: { score: 0, weight: 0.20 },
      availability: { score: 80, weight: 0.15 },
      preference: { score: 65, weight: 0.10 },
      objectiveFit: { score: 90, weight: 0.10 },
      subjectiveFit: { score: 70, weight: 0.15 },
    },
    explanationHe: 'התאמה טיפולית טובה • מציע/ה טיפול מקוון • מתמחה בטראומה ו-PTSD',
    explanationEn: 'Good therapeutic compatibility • Offers online therapy • Specializes in trauma & PTSD',
    explanationItems: [
      { category: 'practical', matched: false, labelHe: 'קופת חולים לא תואמת', labelEn: 'Health fund mismatch' },
      { category: 'practical', matched: true, labelHe: 'מציע טיפול מקוון', labelEn: 'Offers online therapy' },
      { category: 'therapeutic', matched: true, labelHe: 'מתמחה בטראומה צבאית', labelEn: 'Specializes in military trauma' },
      { category: 'objective', matched: true, labelHe: 'ניסיון עם שירות צבאי', labelEn: 'Military service experience' },
      { category: 'subjective', matched: false, labelHe: 'סגנון תקשורת לא תואם', labelEn: 'Communication style mismatch' },
    ],
    isViewed: false,
    isFavorited: false,
    isHidden: false,
    createdAt: new Date('2024-05-16'),
  },
  {
    id: 'match-5',
    patientId: 'patient-1',
    therapistId: 'therapist-3',
    overallScore: 64,
    xFactorScore: 60,
    healthFundScore: 50,
    availabilityScore: 65,
    locationScore: 55,
    preferenceScore: 55,
    objectiveFitScore: 40,
    subjectiveFitScore: 50,
    scoreBreakdown: {
      xFactor: { score: 60, weight: 0.30 },
      healthFund: { score: 50, weight: 0.20 },
      availability: { score: 65, weight: 0.15 },
      preference: { score: 55, weight: 0.10 },
      objectiveFit: { score: 40, weight: 0.10 },
      subjectiveFit: { score: 50, weight: 0.15 },
    },
    explanationHe: 'התאמה טיפולית סבירה • מתמחה בילדים',
    explanationEn: 'Fair therapeutic compatibility • Specializes in children',
    explanationItems: [
      { category: 'practical', matched: false, labelHe: 'קופת חולים חלקית', labelEn: 'Partial health fund coverage' },
      { category: 'therapeutic', matched: false, labelHe: 'התמחות בילדים - לא רלוונטי', labelEn: 'Child specialization - not relevant' },
      { category: 'objective', matched: false, labelHe: 'מטפלת בילדים ומתבגרים בעיקר', labelEn: 'Primarily treats children & adolescents' },
      { category: 'subjective', matched: false, labelHe: 'סגנון טיפולי לא תואם', labelEn: 'Therapy style mismatch' },
    ],
    isViewed: false,
    isFavorited: false,
    isHidden: false,
    createdAt: new Date('2024-05-16'),
  },
];

// ============ SESSIONS ============

export interface MockSession {
  id: string;
  patientId: string;
  therapistId: string;
  scheduledAt: Date;
  duration: number;
  type: string;
  isOnline: boolean;
  status: string;
  meetingUrl: string | null;
  price: number | null;
  healthFund: string | null;
  therapistNotes: string | null;
  createdAt: Date;
}

export const mockSessions: MockSession[] = [
  {
    id: 'session-1',
    patientId: 'patient-1',
    therapistId: 'therapist-1',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    duration: 50,
    type: 'REGULAR',
    isOnline: true,
    status: 'APPROVED',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    price: 0,
    healthFund: 'MACCABI',
    therapistNotes: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session-2',
    patientId: 'patient-1',
    therapistId: 'therapist-1',
    scheduledAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
    duration: 50,
    type: 'REGULAR',
    isOnline: true,
    status: 'PENDING_THERAPIST_APPROVAL',
    meetingUrl: null,
    price: 0,
    healthFund: 'MACCABI',
    therapistNotes: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session-3',
    patientId: 'patient-1',
    therapistId: 'therapist-4',
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    duration: 50,
    type: 'INITIAL_CONSULTATION',
    isOnline: false,
    status: 'COMPLETED',
    meetingUrl: null,
    price: 0,
    healthFund: 'MACCABI',
    therapistNotes: 'פגישת היכרות מוצלחת. המטופל מתאים לטיפול זוגי.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session-4',
    patientId: 'patient-1',
    therapistId: 'therapist-2',
    scheduledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    duration: 50,
    type: 'INITIAL_CONSULTATION',
    isOnline: true,
    status: 'CANCELLED_BY_PATIENT',
    meetingUrl: null,
    price: 500,
    healthFund: null,
    therapistNotes: null,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  },
];

// ============ QUESTIONNAIRE ============

export interface MockQuestionnaireQuestion {
  id: string;
  sectionId: string;
  sectionName: string;
  sectionNameHe: string;
  questionText: string;
  questionTextHe: string;
  helpText: string | null;
  helpTextHe: string | null;
  questionType: string;
  options: any;
  dimension: string;
  scoringWeight: number;
  isRequired: boolean;
  order: number;
}

export const mockQuestionnaireQuestions: MockQuestionnaireQuestion[] = [
  // Section 1: Emotional
  {
    id: 'q-1',
    sectionId: 'emotional',
    sectionName: 'Emotional Style',
    sectionNameHe: 'סגנון רגשי',
    questionText: 'How comfortable are you expressing emotions to others?',
    questionTextHe: 'עד כמה נוח לך לבטא רגשות בפני אחרים?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'כלל לא', 3: 'באופן מתון', 5: 'מאוד' } },
    dimension: 'emotional_intensity',
    scoringWeight: 1.0,
    isRequired: false,
    order: 1,
  },
  {
    id: 'q-2',
    sectionId: 'emotional',
    sectionName: 'Emotional Style',
    sectionNameHe: 'סגנון רגשי',
    questionText: 'How intensely do you experience emotions on a daily basis?',
    questionTextHe: 'עד כמה חזק את/ה חווה רגשות במהלך היום?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'באופן קל', 3: 'באופן ממוצע', 5: 'באופן אינטנסיבי' } },
    dimension: 'emotional_intensity',
    scoringWeight: 1.0,
    isRequired: false,
    order: 2,
  },
  {
    id: 'q-3',
    sectionId: 'emotional',
    sectionName: 'Emotional Style',
    sectionNameHe: 'סגנון רגשי',
    questionText: 'How well do you sleep on most nights?',
    questionTextHe: 'עד כמה טוב את/ה ישנ/ה ברוב הלילות?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'גרוע', 3: 'סביר', 5: 'מצוין' } },
    dimension: 'sleep',
    scoringWeight: 0.8,
    isRequired: false,
    order: 3,
  },
  // Section 2: Personality
  {
    id: 'q-4',
    sectionId: 'personality',
    sectionName: 'Personality',
    sectionNameHe: 'אישיות',
    questionText: 'How open are you to trying new approaches?',
    questionTextHe: 'עד כמה את/ה פתוח/ה לנסות גישות חדשות?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'כלל לא', 3: 'באופן מתון', 5: 'מאוד' } },
    dimension: 'openness',
    scoringWeight: 1.0,
    isRequired: false,
    order: 4,
  },
  {
    id: 'q-5',
    sectionId: 'personality',
    sectionName: 'Personality',
    sectionNameHe: 'אישיות',
    questionText: 'Do you prefer structured or flexible treatment plans?',
    questionTextHe: 'את/ה מעדיפ/ה טיפול מובנה או גמיש?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'מובנה מאוד', 3: 'מאוזן', 5: 'גמיש מאוד' } },
    dimension: 'structure',
    scoringWeight: 1.0,
    isRequired: false,
    order: 5,
  },
  {
    id: 'q-6',
    sectionId: 'personality',
    sectionName: 'Personality',
    sectionNameHe: 'אישיות',
    questionText: 'How ready do you feel for making changes in your life?',
    questionTextHe: 'עד כמה את/ה מרגיש/ה מוכנ/ה לשינויים בחיים?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'לא מוכנ/ה', 3: 'מתלבט/ת', 5: 'מוכנ/ה מאוד' } },
    dimension: 'change_readiness',
    scoringWeight: 1.0,
    isRequired: false,
    order: 6,
  },
  // Section 3: Communication
  {
    id: 'q-7',
    sectionId: 'communication',
    sectionName: 'Communication Style',
    sectionNameHe: 'סגנון תקשורת',
    questionText: 'How do you prefer to communicate in therapy?',
    questionTextHe: 'איך את/ה מעדיפ/ה לתקשר בטיפול?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'מקשיב/ה בעיקר', 3: 'מאוזן', 5: 'מדבר/ת הרבה' } },
    dimension: 'communication',
    scoringWeight: 1.0,
    isRequired: false,
    order: 7,
  },
  {
    id: 'q-8',
    sectionId: 'communication',
    sectionName: 'Communication Style',
    sectionNameHe: 'סגנון תקשורת',
    questionText: 'What kind of therapeutic relationship do you prefer?',
    questionTextHe: 'איזה סוג קשר טיפולי את/ה מעדיפ/ה?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'מנחה ומוביל', 3: 'מאוזן', 5: 'שיתופי ושוויוני' } },
    dimension: 'relationship',
    scoringWeight: 1.0,
    isRequired: false,
    order: 8,
  },
  // Section 4: Context
  {
    id: 'q-9',
    sectionId: 'context',
    sectionName: 'Life Context',
    sectionNameHe: 'הקשר חיים',
    questionText: 'How would you rate your current stress level?',
    questionTextHe: 'איך את/ה מדרג/ת את רמת הלחץ הנוכחית שלך?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'נמוכה', 3: 'בינונית', 5: 'גבוהה מאוד' } },
    dimension: 'stress',
    scoringWeight: 0.8,
    isRequired: false,
    order: 9,
  },
  {
    id: 'q-10',
    sectionId: 'context',
    sectionName: 'Life Context',
    sectionNameHe: 'הקשר חיים',
    questionText: 'How would you describe your emotional load recently?',
    questionTextHe: 'איך את/ה מתאר/ת את העומס הרגשי שלך לאחרונה?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'קל', 3: 'בינוני', 5: 'כבד מאוד' } },
    dimension: 'emotional_load',
    scoringWeight: 0.8,
    isRequired: true,
    order: 10,
  },
  // Section 5: Military Service (required for Israeli context)
  {
    id: 'q-11',
    sectionId: 'military',
    sectionName: 'Military Service',
    sectionNameHe: 'שירות צבאי',
    questionText: 'Have you served in the military?',
    questionTextHe: 'האם שירתת בצבא?',
    helpText: 'This helps us match you with therapists experienced in military-related issues',
    helpTextHe: 'מידע זה עוזר לנו להתאים לך מטפלים עם ניסיון בנושאים הקשורים לשירות צבאי',
    questionType: 'YES_NO',
    options: { yes: 'כן', no: 'לא' },
    dimension: 'military_service',
    scoringWeight: 1.0,
    isRequired: true,
    order: 11,
  },
  {
    id: 'q-12',
    sectionId: 'military',
    sectionName: 'Military Service',
    sectionNameHe: 'שירות צבאי',
    questionText: 'Are you currently serving in reserve duty (miluim)?',
    questionTextHe: 'האם את/ה משרת/ת כיום במילואים?',
    helpText: null,
    helpTextHe: null,
    questionType: 'YES_NO',
    options: { yes: 'כן', no: 'לא' },
    dimension: 'military_reserve',
    scoringWeight: 1.0,
    isRequired: true,
    order: 12,
  },
  {
    id: 'q-13',
    sectionId: 'military',
    sectionName: 'Military Service',
    sectionNameHe: 'שירות צבאי',
    questionText: 'If you served, did you experience combat or high-stress situations?',
    questionTextHe: 'אם שירתת, האם חווית מצבי לחימה או לחץ גבוה?',
    helpText: 'This is optional but helps us understand your needs better',
    helpTextHe: 'שאלה זו אופציונלית אך עוזרת לנו להבין טוב יותר את הצרכים שלך',
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'לא רלוונטי/לא שירתתי', 2: 'מעט', 3: 'באופן מתון', 4: 'לעיתים קרובות', 5: 'באופן משמעותי' } },
    dimension: 'military_stress',
    scoringWeight: 1.0,
    isRequired: false,
    order: 13,
  },
  {
    id: 'q-14',
    sectionId: 'military',
    sectionName: 'Military Service',
    sectionNameHe: 'שירות צבאי',
    questionText: 'Would you prefer a therapist with military background or experience treating veterans?',
    questionTextHe: 'האם את/ה מעדיפ/ה מטפל/ת עם רקע צבאי או ניסיון בטיפול בחיילים ומשוחררים?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'לא משנה לי', 3: 'מעדיפ/ה במידה מתונה', 5: 'מעדיפ/ה מאוד' } },
    dimension: 'military_therapist_preference',
    scoringWeight: 0.8,
    isRequired: true,
    order: 14,
  },
  // Section 6: Session Preferences (required)
  {
    id: 'q-15',
    sectionId: 'preferences',
    sectionName: 'Session Preferences',
    sectionNameHe: 'העדפות טיפול',
    questionText: 'Do you prefer online or in-person sessions?',
    questionTextHe: 'האם את/ה מעדיפ/ה פגישות מקוונות או פגישות פרונטליות?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'מקוון בלבד', 2: 'מעדיפ/ה מקוון', 3: 'אין העדפה', 4: 'מעדיפ/ה פרונטלי', 5: 'פרונטלי בלבד' } },
    dimension: 'session_format',
    scoringWeight: 1.2,
    isRequired: true,
    order: 15,
  },
  {
    id: 'q-16',
    sectionId: 'preferences',
    sectionName: 'Session Preferences',
    sectionNameHe: 'העדפות טיפול',
    questionText: 'How important is it that your therapist is covered by your health fund (Kupat Cholim)?',
    questionTextHe: 'עד כמה חשוב לך שהמטפל/ת יהיה/תהיה בהסדר עם קופת החולים שלך?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'לא חשוב', 3: 'חשוב במידה מתונה', 5: 'חשוב מאוד' } },
    dimension: 'health_fund_importance',
    scoringWeight: 1.0,
    isRequired: true,
    order: 16,
  },
  {
    id: 'q-17',
    sectionId: 'preferences',
    sectionName: 'Session Preferences',
    sectionNameHe: 'העדפות טיפול',
    questionText: 'Do you have a gender preference for your therapist?',
    questionTextHe: 'האם יש לך העדפה למגדר המטפל/ת?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'no_preference', label: 'אין העדפה', labelEn: 'No preference' },
      { value: 'female', label: 'מעדיפ/ה אישה', labelEn: 'Prefer female' },
      { value: 'male', label: 'מעדיפ/ה גבר', labelEn: 'Prefer male' }
    ]},
    dimension: 'gender_preference',
    scoringWeight: 0.8,
    isRequired: true,
    order: 17,
  },
  // Section 7: Personal/Objective Data (NEW)
  {
    id: 'q-18',
    sectionId: 'personal',
    sectionName: 'Personal Information',
    sectionNameHe: 'נתונים אישיים',
    questionText: 'What is your marital status?',
    questionTextHe: 'מה המצב המשפחתי שלך?',
    helpText: 'This helps us match you with therapists experienced in relevant life situations',
    helpTextHe: 'מידע זה עוזר לנו להתאים מטפלים בעלי ניסיון רלוונטי',
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'SINGLE', label: 'רווק/ה', labelEn: 'Single' },
      { value: 'IN_RELATIONSHIP', label: 'בזוגיות', labelEn: 'In a relationship' },
      { value: 'MARRIED', label: 'נשוי/אה', labelEn: 'Married' },
      { value: 'DIVORCED', label: 'גרוש/ה', labelEn: 'Divorced' },
      { value: 'WIDOWED', label: 'אלמן/ה', labelEn: 'Widowed' },
    ]},
    dimension: 'marital_status',
    scoringWeight: 0.6,
    isRequired: false,
    order: 18,
  },
  {
    id: 'q-19',
    sectionId: 'personal',
    sectionName: 'Personal Information',
    sectionNameHe: 'נתונים אישיים',
    questionText: 'What type of military service have you completed?',
    questionTextHe: 'איזה סוג שירות צבאי עברת?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'NONE', label: 'לא שירתתי', labelEn: 'No service' },
      { value: 'MANDATORY', label: 'שירות חובה', labelEn: 'Mandatory service' },
      { value: 'CAREER', label: 'קבע', labelEn: 'Career military' },
      { value: 'RESERVE', label: 'מילואים', labelEn: 'Reserve duty' },
    ]},
    dimension: 'military_service_type',
    scoringWeight: 0.8,
    isRequired: false,
    order: 19,
  },
  {
    id: 'q-20',
    sectionId: 'personal',
    sectionName: 'Personal Information',
    sectionNameHe: 'נתונים אישיים',
    questionText: 'What is your religious affiliation?',
    questionTextHe: 'מה הזיקה הדתית שלך?',
    helpText: 'Helps match with culturally aligned therapists',
    helpTextHe: 'עוזר להתאים מטפלים בעלי רקע תרבותי מתאים',
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'SECULAR', label: 'חילוני', labelEn: 'Secular' },
      { value: 'TRADITIONAL', label: 'מסורתי', labelEn: 'Traditional' },
      { value: 'RELIGIOUS', label: 'דתי', labelEn: 'Religious' },
      { value: 'ULTRA_ORTHODOX', label: 'חרדי', labelEn: 'Ultra-Orthodox' },
      { value: 'OTHER', label: 'אחר', labelEn: 'Other' },
    ]},
    dimension: 'religious_affiliation',
    scoringWeight: 0.6,
    isRequired: false,
    order: 20,
  },
  {
    id: 'q-21',
    sectionId: 'personal',
    sectionName: 'Personal Information',
    sectionNameHe: 'נתונים אישיים',
    questionText: 'What is your current work status?',
    questionTextHe: 'מה סטטוס התעסוקה הנוכחי שלך?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'EMPLOYED', label: 'שכיר/ה', labelEn: 'Employed' },
      { value: 'SELF_EMPLOYED', label: 'עצמאי/ת', labelEn: 'Self-employed' },
      { value: 'UNEMPLOYED', label: 'לא עובד/ת', labelEn: 'Unemployed' },
      { value: 'STUDENT', label: 'סטודנט/ית', labelEn: 'Student' },
      { value: 'RETIRED', label: 'פנסיונר/ית', labelEn: 'Retired' },
      { value: 'MILITARY_SERVICE', label: 'בשירות צבאי', labelEn: 'Military service' },
    ]},
    dimension: 'work_status',
    scoringWeight: 0.4,
    isRequired: false,
    order: 21,
  },
  {
    id: 'q-22',
    sectionId: 'personal',
    sectionName: 'Personal Information',
    sectionNameHe: 'נתונים אישיים',
    questionText: 'What is your education level?',
    questionTextHe: 'מה רמת ההשכלה שלך?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'HIGH_SCHOOL', label: 'תיכונית', labelEn: 'High school' },
      { value: 'SOME_COLLEGE', label: 'לימודים חלקיים', labelEn: 'Some college' },
      { value: 'BACHELORS', label: 'תואר ראשון', labelEn: "Bachelor's" },
      { value: 'MASTERS', label: 'תואר שני', labelEn: "Master's" },
      { value: 'DOCTORATE', label: 'דוקטורט', labelEn: 'Doctorate' },
      { value: 'OTHER', label: 'אחר', labelEn: 'Other' },
    ]},
    dimension: 'education_level',
    scoringWeight: 0.3,
    isRequired: false,
    order: 22,
  },
  // Section 8: Communication & Needs (NEW — Subjective)
  {
    id: 'q-23',
    sectionId: 'communication_needs',
    sectionName: 'Communication & Needs',
    sectionNameHe: 'סגנון תקשורת וצרכים',
    questionText: 'What communication style do you prefer from your therapist?',
    questionTextHe: 'איזה סגנון תקשורת את/ה מעדיפ/ה מהמטפל/ת שלך?',
    helpText: 'Choose the style that feels most comfortable for you',
    helpTextHe: 'בחר/י את הסגנון שמרגיש לך הכי נוח',
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'DIRECT', label: 'ישיר - תכל\'ס, ברור', labelEn: 'Direct - straightforward, clear' },
      { value: 'GENTLE', label: 'עדין - רך, תומך', labelEn: 'Gentle - soft, supportive' },
      { value: 'ANALYTICAL', label: 'אנליטי - מנתח, מדויק', labelEn: 'Analytical - precise, logical' },
      { value: 'SPIRITUAL', label: 'רוחני - עמוק, פילוסופי', labelEn: 'Spiritual - deep, philosophical' },
      { value: 'STRUCTURED', label: 'מובנה - מסודר, שיטתי', labelEn: 'Structured - organized, systematic' },
    ]},
    dimension: 'communication_style_preference',
    scoringWeight: 1.2,
    isRequired: true,
    order: 23,
  },
  {
    id: 'q-24',
    sectionId: 'communication_needs',
    sectionName: 'Communication & Needs',
    sectionNameHe: 'סגנון תקשורת וצרכים',
    questionText: 'What do you need most from therapy? (Select all that apply)',
    questionTextHe: 'מה את/ה הכי צריך/ה מטיפול? (ניתן לבחור יותר מאחד)',
    helpText: 'Select the needs that resonate most with you',
    helpTextHe: 'בחר/י את הצרכים שהכי מהדהדים איתך',
    questionType: 'MULTI_SELECT',
    options: { choices: [
      { value: 'VALIDATION', label: 'אימות - שמישהו ישמע ויאשר', labelEn: 'Validation - to be heard and affirmed' },
      { value: 'TOOLS', label: 'כלים - טכניקות מעשיות להתמודדות', labelEn: 'Tools - practical coping techniques' },
      { value: 'EXPLORATION', label: 'חקירה - להבין את עצמי לעומק', labelEn: 'Exploration - to understand myself deeply' },
      { value: 'ACCOUNTABILITY', label: 'אחריותיות - מישהו שיעקוב אחרי התקדמות', labelEn: 'Accountability - someone to track progress' },
    ]},
    dimension: 'emotional_needs',
    scoringWeight: 1.2,
    isRequired: true,
    order: 24,
  },
  {
    id: 'q-25',
    sectionId: 'communication_needs',
    sectionName: 'Communication & Needs',
    sectionNameHe: 'סגנון תקשורת וצרכים',
    questionText: 'What therapy style do you prefer?',
    questionTextHe: 'איזה סגנון טיפול את/ה מעדיפ/ה?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'DIRECTIVE', label: 'מנחה - המטפל/ת מוביל/ה', labelEn: 'Directive - therapist leads' },
      { value: 'EXPLORATORY', label: 'חוקר - גילוי עצמי משותף', labelEn: 'Exploratory - mutual discovery' },
      { value: 'STRUCTURED', label: 'מובנה - תוכנית ברורה ומדידה', labelEn: 'Structured - clear measurable plan' },
      { value: 'FLEXIBLE', label: 'גמיש - לפי מה שעולה בטיפול', labelEn: 'Flexible - based on what comes up' },
    ]},
    dimension: 'therapy_style_preference',
    scoringWeight: 1.0,
    isRequired: true,
    order: 25,
  },
];

// ============ HELPER: get therapist by id ============

export function getTherapistById(id: string): MockTherapist | undefined {
  return mockTherapists.find((t) => t.id === id);
}

export function getMatchWithTherapist(match: MockMatch) {
  const therapist = getTherapistById(match.therapistId);
  return {
    ...match,
    therapist: therapist
      ? {
          id: therapist.id,
          firstName: therapist.firstName,
          lastName: therapist.lastName,
          title: therapist.title,
          photoUrl: therapist.photoUrl,
          photoThumbnailUrl: therapist.photoThumbnailUrl,
          city: therapist.city,
          offersOnline: therapist.offersOnline,
          offersInPerson: therapist.offersInPerson,
          approaches: therapist.approaches,
          specializations: therapist.specializations,
          acceptedHealthFunds: therapist.acceptedHealthFunds,
          sessionPrice: therapist.sessionPrice,
          bio: therapist.bio,
          bioHebrew: therapist.bioHebrew,
          yearsOfExperience: therapist.yearsOfExperience,
        }
      : null,
  };
}

export function getSessionWithDetails(session: MockSession) {
  const therapist = getTherapistById(session.therapistId);
  return {
    ...session,
    therapist: therapist
      ? {
          id: therapist.id,
          firstName: therapist.firstName,
          lastName: therapist.lastName,
          title: therapist.title,
          photoUrl: therapist.photoUrl,
          photoThumbnailUrl: therapist.photoThumbnailUrl,
        }
      : null,
    patient: {
      id: mockPatient.id,
      firstName: mockPatient.firstName,
      lastName: mockPatient.lastName,
    },
  };
}

// ============ MESSAGES ============

export interface MockMessageThread {
  id: string;
  patientId: string;
  therapistId: string;
  subject: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
}

export interface MockMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  readAt: Date | null;
  createdAt: Date;
}

export const mockMessageThreads: MockMessageThread[] = [
  {
    id: 'thread-1',
    patientId: mockPatient.id,
    therapistId: 'therapist-1',
    subject: 'Appointment follow-up',
    lastMessageAt: new Date('2024-06-15T14:30:00'),
    createdAt: new Date('2024-06-10'),
  },
];

export const mockMessages: MockMessage[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: mockPatient.userId,
    senderRole: 'PATIENT',
    content: 'Thank you for the session today. I had a question about the exercise you recommended.',
    readAt: new Date('2024-06-15T14:00:00'),
    createdAt: new Date('2024-06-15T10:00:00'),
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    senderId: 'user-therapist-1',
    senderRole: 'THERAPIST',
    content: 'Of course! Feel free to ask. The breathing exercise should be done twice daily for 5 minutes.',
    readAt: null,
    createdAt: new Date('2024-06-15T14:30:00'),
  },
];
