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
  firstName: 'Israel',
  lastName: 'Israeli',
  email: 'patient@example.com',
  phone: '050-1234567',
  city: 'Tel Aviv',
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
    explanationHe: 'Very high therapeutic compatibility • Works with Maccabi • Offers online therapy • Specializes in anxiety',
    explanationEn: 'Very high therapeutic compatibility • Works with Maccabi • Offers online therapy • Specializes in anxiety',
    explanationItems: [
      { category: 'practical', matched: true, labelHe: 'Health fund match (Maccabi)', labelEn: 'Health fund match (Maccabi)' },
      { category: 'practical', matched: true, labelHe: 'Offers online therapy', labelEn: 'Offers online therapy' },
      { category: 'therapeutic', matched: true, labelHe: 'CBT therapy style match', labelEn: 'CBT therapy style match' },
      { category: 'subjective', matched: true, labelHe: 'Direct communication style', labelEn: 'Direct communication style' },
      { category: 'subjective', matched: true, labelHe: 'Focuses on tools & accountability', labelEn: 'Focuses on tools & accountability' },
      { category: 'objective', matched: true, labelHe: 'Treats adults', labelEn: 'Treats adults' },
      { category: 'objective', matched: true, labelHe: 'Secular background match', labelEn: 'Secular background match' },
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
    explanationHe: 'Very high therapeutic compatibility • Works with Maccabi • Specializes in relationships',
    explanationEn: 'Very high therapeutic compatibility • Works with Maccabi • Specializes in relationships',
    explanationItems: [
      { category: 'practical', matched: true, labelHe: 'Health fund match (Maccabi)', labelEn: 'Health fund match (Maccabi)' },
      { category: 'practical', matched: true, labelHe: 'Offers online & in-person', labelEn: 'Offers online & in-person' },
      { category: 'therapeutic', matched: true, labelHe: 'Specializes in relationships & family', labelEn: 'Specializes in relationships & family' },
      { category: 'subjective', matched: false, labelHe: 'Communication style partial match', labelEn: 'Communication style partial match' },
      { category: 'objective', matched: true, labelHe: 'Treats adults', labelEn: 'Treats adults' },
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
    explanationHe: 'Good therapeutic compatibility • Works with Maccabi • Offers online therapy • Specializes in stress',
    explanationEn: 'Good therapeutic compatibility • Works with Maccabi • Offers online therapy • Specializes in stress',
    explanationItems: [
      { category: 'practical', matched: true, labelHe: 'Health fund match (Maccabi)', labelEn: 'Health fund match (Maccabi)' },
      { category: 'practical', matched: true, labelHe: 'Offers online therapy', labelEn: 'Offers online therapy' },
      { category: 'therapeutic', matched: true, labelHe: 'Specializes in stress & sleep', labelEn: 'Specializes in stress & sleep' },
      { category: 'subjective', matched: true, labelHe: 'Structured style match', labelEn: 'Structured style match' },
      { category: 'objective', matched: true, labelHe: 'Secular background match', labelEn: 'Secular background match' },
      { category: 'objective', matched: false, labelHe: 'No military experience', labelEn: 'No military experience' },
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
    explanationHe: 'Good therapeutic compatibility • Offers online therapy • Specializes in trauma & PTSD',
    explanationEn: 'Good therapeutic compatibility • Offers online therapy • Specializes in trauma & PTSD',
    explanationItems: [
      { category: 'practical', matched: false, labelHe: 'Health fund mismatch', labelEn: 'Health fund mismatch' },
      { category: 'practical', matched: true, labelHe: 'Offers online therapy', labelEn: 'Offers online therapy' },
      { category: 'therapeutic', matched: true, labelHe: 'Specializes in military trauma', labelEn: 'Specializes in military trauma' },
      { category: 'objective', matched: true, labelHe: 'Military service experience', labelEn: 'Military service experience' },
      { category: 'subjective', matched: false, labelHe: 'Communication style mismatch', labelEn: 'Communication style mismatch' },
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
    explanationHe: 'Fair therapeutic compatibility • Specializes in children',
    explanationEn: 'Fair therapeutic compatibility • Specializes in children',
    explanationItems: [
      { category: 'practical', matched: false, labelHe: 'Partial health fund coverage', labelEn: 'Partial health fund coverage' },
      { category: 'therapeutic', matched: false, labelHe: 'Child specialization - not relevant', labelEn: 'Child specialization - not relevant' },
      { category: 'objective', matched: false, labelHe: 'Primarily treats children & adolescents', labelEn: 'Primarily treats children & adolescents' },
      { category: 'subjective', matched: false, labelHe: 'Therapy style mismatch', labelEn: 'Therapy style mismatch' },
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
    therapistNotes: 'Successful introductory session. Patient is suitable for couples therapy.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session-4',
    patientId: 'patient-1',
    therapistId: 'therapist-2',
    scheduledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
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
  {
    id: 'session-5',
    patientId: 'patient-1',
    therapistId: 'therapist-1',
    scheduledAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    duration: 50,
    type: 'REGULAR',
    isOnline: true,
    status: 'COMPLETED',
    meetingUrl: null,
    price: 0,
    healthFund: 'MACCABI',
    therapistNotes: 'Good progress on anxiety management. Introduced breathing exercises and journaling assignment.',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session-6',
    patientId: 'patient-1',
    therapistId: 'therapist-1',
    scheduledAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    duration: 50,
    type: 'INITIAL_CONSULTATION',
    isOnline: true,
    status: 'COMPLETED',
    meetingUrl: null,
    price: 0,
    healthFund: 'MACCABI',
    therapistNotes: 'Initial assessment completed. Patient presents with moderate work-related anxiety. Recommended weekly sessions.',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session-7',
    patientId: 'patient-1',
    therapistId: 'therapist-5',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    duration: 50,
    type: 'INITIAL_CONSULTATION',
    isOnline: true,
    status: 'PENDING_THERAPIST_APPROVAL',
    meetingUrl: null,
    price: 400,
    healthFund: null,
    therapistNotes: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
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
    sectionNameHe: 'Emotional Style',
    questionText: 'How comfortable are you expressing emotions to others?',
    questionTextHe: 'How comfortable are you expressing emotions to others?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Not at all', 3: 'Moderately', 5: 'Very much' } },
    dimension: 'emotional_intensity',
    scoringWeight: 1.0,
    isRequired: false,
    order: 1,
  },
  {
    id: 'q-2',
    sectionId: 'emotional',
    sectionName: 'Emotional Style',
    sectionNameHe: 'Emotional Style',
    questionText: 'How intensely do you experience emotions on a daily basis?',
    questionTextHe: 'How intensely do you experience emotions on a daily basis?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Mildly', 3: 'Moderately', 5: 'Very intensely' } },
    dimension: 'emotional_intensity',
    scoringWeight: 1.0,
    isRequired: false,
    order: 2,
  },
  {
    id: 'q-3',
    sectionId: 'emotional',
    sectionName: 'Emotional Style',
    sectionNameHe: 'Emotional Style',
    questionText: 'How well do you sleep on most nights?',
    questionTextHe: 'How well do you sleep on most nights?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Poorly', 3: 'Moderate', 5: 'Excellent' } },
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
    sectionNameHe: 'Personality',
    questionText: 'How open are you to trying new approaches?',
    questionTextHe: 'How open are you to trying new approaches?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Not at all', 3: 'Moderately', 5: 'Very much' } },
    dimension: 'openness',
    scoringWeight: 1.0,
    isRequired: false,
    order: 4,
  },
  {
    id: 'q-5',
    sectionId: 'personality',
    sectionName: 'Personality',
    sectionNameHe: 'Personality',
    questionText: 'Do you prefer structured or flexible treatment plans?',
    questionTextHe: 'Do you prefer structured or flexible treatment plans?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Very structured', 3: 'Balanced', 5: 'Very flexible' } },
    dimension: 'structure',
    scoringWeight: 1.0,
    isRequired: false,
    order: 5,
  },
  {
    id: 'q-6',
    sectionId: 'personality',
    sectionName: 'Personality',
    sectionNameHe: 'Personality',
    questionText: 'How ready do you feel for making changes in your life?',
    questionTextHe: 'How ready do you feel for making changes in your life?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Not ready', 3: 'Considering it', 5: 'Very ready' } },
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
    sectionNameHe: 'Communication Style',
    questionText: 'How do you prefer to communicate in therapy?',
    questionTextHe: 'How do you prefer to communicate in therapy?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Mostly listening', 3: 'Balanced', 5: 'Very talkative' } },
    dimension: 'communication',
    scoringWeight: 1.0,
    isRequired: false,
    order: 7,
  },
  {
    id: 'q-8',
    sectionId: 'communication',
    sectionName: 'Communication Style',
    sectionNameHe: 'Communication Style',
    questionText: 'What kind of therapeutic relationship do you prefer?',
    questionTextHe: 'What kind of therapeutic relationship do you prefer?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Guided & led', 3: 'Balanced', 5: 'Collaborative & equal' } },
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
    sectionNameHe: 'Life Context',
    questionText: 'How would you rate your current stress level?',
    questionTextHe: 'How would you rate your current stress level?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Low', 3: 'Moderate', 5: 'Very high' } },
    dimension: 'stress',
    scoringWeight: 0.8,
    isRequired: false,
    order: 9,
  },
  {
    id: 'q-10',
    sectionId: 'context',
    sectionName: 'Life Context',
    sectionNameHe: 'Life Context',
    questionText: 'How would you describe your emotional load recently?',
    questionTextHe: 'How would you describe your emotional load recently?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Light', 3: 'Moderate', 5: 'Very heavy' } },
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
    sectionNameHe: 'Military Service',
    questionText: 'Have you served in the military?',
    questionTextHe: 'Have you served in the military?',
    helpText: 'This helps us match you with therapists experienced in military-related issues',
    helpTextHe: 'This helps us match you with therapists experienced in military-related issues',
    questionType: 'YES_NO',
    options: { yes: 'Yes', no: 'No' },
    dimension: 'military_service',
    scoringWeight: 1.0,
    isRequired: true,
    order: 11,
  },
  {
    id: 'q-12',
    sectionId: 'military',
    sectionName: 'Military Service',
    sectionNameHe: 'Military Service',
    questionText: 'Are you currently serving in reserve duty (miluim)?',
    questionTextHe: 'Are you currently serving in reserve duty (miluim)?',
    helpText: null,
    helpTextHe: null,
    questionType: 'YES_NO',
    options: { yes: 'Yes', no: 'No' },
    dimension: 'military_reserve',
    scoringWeight: 1.0,
    isRequired: true,
    order: 12,
  },
  {
    id: 'q-13',
    sectionId: 'military',
    sectionName: 'Military Service',
    sectionNameHe: 'Military Service',
    questionText: 'If you served, did you experience combat or high-stress situations?',
    questionTextHe: 'If you served, did you experience combat or high-stress situations?',
    helpText: 'This is optional but helps us understand your needs better',
    helpTextHe: 'This is optional but helps us understand your needs better',
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Not applicable', 2: 'Rarely', 3: 'Moderately', 4: 'Often', 5: 'Significantly' } },
    dimension: 'military_stress',
    scoringWeight: 1.0,
    isRequired: false,
    order: 13,
  },
  {
    id: 'q-14',
    sectionId: 'military',
    sectionName: 'Military Service',
    sectionNameHe: 'Military Service',
    questionText: 'Would you prefer a therapist with military background or experience treating veterans?',
    questionTextHe: 'Would you prefer a therapist with military background or experience treating veterans?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: "Doesn't matter", 3: 'Moderately prefer', 5: 'Strongly prefer' } },
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
    sectionNameHe: 'Session Preferences',
    questionText: 'Do you prefer online or in-person sessions?',
    questionTextHe: 'Do you prefer online or in-person sessions?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Online only', 2: 'Prefer online', 3: 'No preference', 4: 'Prefer in-person', 5: 'In-person only' } },
    dimension: 'session_format',
    scoringWeight: 1.2,
    isRequired: true,
    order: 15,
  },
  {
    id: 'q-16',
    sectionId: 'preferences',
    sectionName: 'Session Preferences',
    sectionNameHe: 'Session Preferences',
    questionText: 'How important is it that your therapist is covered by your health fund (Kupat Cholim)?',
    questionTextHe: 'How important is it that your therapist is covered by your health fund (Kupat Cholim)?',
    helpText: null,
    helpTextHe: null,
    questionType: 'SCALE',
    options: { min: 1, max: 5, labels: { 1: 'Not important', 3: 'Moderately important', 5: 'Very important' } },
    dimension: 'health_fund_importance',
    scoringWeight: 1.0,
    isRequired: true,
    order: 16,
  },
  {
    id: 'q-17',
    sectionId: 'preferences',
    sectionName: 'Session Preferences',
    sectionNameHe: 'Session Preferences',
    questionText: 'Do you have a gender preference for your therapist?',
    questionTextHe: 'Do you have a gender preference for your therapist?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'no_preference', label: 'No preference', labelEn: 'No preference' },
      { value: 'female', label: 'Prefer female', labelEn: 'Prefer female' },
      { value: 'male', label: 'Prefer male', labelEn: 'Prefer male' }
    ]},
    dimension: 'gender_preference',
    scoringWeight: 0.8,
    isRequired: true,
    order: 17,
  },
  // Section 7: Personal/Objective Data
  {
    id: 'q-18',
    sectionId: 'personal',
    sectionName: 'Personal Information',
    sectionNameHe: 'Personal Information',
    questionText: 'What is your marital status?',
    questionTextHe: 'What is your marital status?',
    helpText: 'This helps us match you with therapists experienced in relevant life situations',
    helpTextHe: 'This helps us match you with therapists experienced in relevant life situations',
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'SINGLE', label: 'Single', labelEn: 'Single' },
      { value: 'IN_RELATIONSHIP', label: 'In a relationship', labelEn: 'In a relationship' },
      { value: 'MARRIED', label: 'Married', labelEn: 'Married' },
      { value: 'DIVORCED', label: 'Divorced', labelEn: 'Divorced' },
      { value: 'WIDOWED', label: 'Widowed', labelEn: 'Widowed' },
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
    sectionNameHe: 'Personal Information',
    questionText: 'What type of military service have you completed?',
    questionTextHe: 'What type of military service have you completed?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'NONE', label: 'No service', labelEn: 'No service' },
      { value: 'MANDATORY', label: 'Mandatory service', labelEn: 'Mandatory service' },
      { value: 'CAREER', label: 'Career military', labelEn: 'Career military' },
      { value: 'RESERVE', label: 'Reserve duty', labelEn: 'Reserve duty' },
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
    sectionNameHe: 'Personal Information',
    questionText: 'What is your religious affiliation?',
    questionTextHe: 'What is your religious affiliation?',
    helpText: 'Helps match with culturally aligned therapists',
    helpTextHe: 'Helps match with culturally aligned therapists',
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'SECULAR', label: 'Secular', labelEn: 'Secular' },
      { value: 'TRADITIONAL', label: 'Traditional', labelEn: 'Traditional' },
      { value: 'RELIGIOUS', label: 'Religious', labelEn: 'Religious' },
      { value: 'ULTRA_ORTHODOX', label: 'Ultra-Orthodox', labelEn: 'Ultra-Orthodox' },
      { value: 'OTHER', label: 'Other', labelEn: 'Other' },
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
    sectionNameHe: 'Personal Information',
    questionText: 'What is your current work status?',
    questionTextHe: 'What is your current work status?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'EMPLOYED', label: 'Employed', labelEn: 'Employed' },
      { value: 'SELF_EMPLOYED', label: 'Self-employed', labelEn: 'Self-employed' },
      { value: 'UNEMPLOYED', label: 'Unemployed', labelEn: 'Unemployed' },
      { value: 'STUDENT', label: 'Student', labelEn: 'Student' },
      { value: 'RETIRED', label: 'Retired', labelEn: 'Retired' },
      { value: 'MILITARY_SERVICE', label: 'Military service', labelEn: 'Military service' },
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
    sectionNameHe: 'Personal Information',
    questionText: 'What is your education level?',
    questionTextHe: 'What is your education level?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'HIGH_SCHOOL', label: 'High school', labelEn: 'High school' },
      { value: 'SOME_COLLEGE', label: 'Some college', labelEn: 'Some college' },
      { value: 'BACHELORS', label: "Bachelor's", labelEn: "Bachelor's" },
      { value: 'MASTERS', label: "Master's", labelEn: "Master's" },
      { value: 'DOCTORATE', label: 'Doctorate', labelEn: 'Doctorate' },
      { value: 'OTHER', label: 'Other', labelEn: 'Other' },
    ]},
    dimension: 'education_level',
    scoringWeight: 0.3,
    isRequired: false,
    order: 22,
  },
  // Section 8: Communication & Needs (Subjective)
  {
    id: 'q-23',
    sectionId: 'communication_needs',
    sectionName: 'Communication & Needs',
    sectionNameHe: 'Communication & Needs',
    questionText: 'What communication style do you prefer from your therapist?',
    questionTextHe: 'What communication style do you prefer from your therapist?',
    helpText: 'Choose the style that feels most comfortable for you',
    helpTextHe: 'Choose the style that feels most comfortable for you',
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'DIRECT', label: 'Direct - straightforward, clear', labelEn: 'Direct - straightforward, clear' },
      { value: 'GENTLE', label: 'Gentle - soft, supportive', labelEn: 'Gentle - soft, supportive' },
      { value: 'ANALYTICAL', label: 'Analytical - precise, logical', labelEn: 'Analytical - precise, logical' },
      { value: 'SPIRITUAL', label: 'Spiritual - deep, philosophical', labelEn: 'Spiritual - deep, philosophical' },
      { value: 'STRUCTURED', label: 'Structured - organized, systematic', labelEn: 'Structured - organized, systematic' },
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
    sectionNameHe: 'Communication & Needs',
    questionText: 'What do you need most from therapy? (Select all that apply)',
    questionTextHe: 'What do you need most from therapy? (Select all that apply)',
    helpText: 'Select the needs that resonate most with you',
    helpTextHe: 'Select the needs that resonate most with you',
    questionType: 'MULTI_SELECT',
    options: { choices: [
      { value: 'VALIDATION', label: 'Validation - to be heard and affirmed', labelEn: 'Validation - to be heard and affirmed' },
      { value: 'TOOLS', label: 'Tools - practical coping techniques', labelEn: 'Tools - practical coping techniques' },
      { value: 'EXPLORATION', label: 'Exploration - to understand myself deeply', labelEn: 'Exploration - to understand myself deeply' },
      { value: 'ACCOUNTABILITY', label: 'Accountability - someone to track progress', labelEn: 'Accountability - someone to track progress' },
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
    sectionNameHe: 'Communication & Needs',
    questionText: 'What therapy style do you prefer?',
    questionTextHe: 'What therapy style do you prefer?',
    helpText: null,
    helpTextHe: null,
    questionType: 'MULTIPLE_CHOICE',
    options: { choices: [
      { value: 'DIRECTIVE', label: 'Directive - therapist leads', labelEn: 'Directive - therapist leads' },
      { value: 'EXPLORATORY', label: 'Exploratory - mutual discovery', labelEn: 'Exploratory - mutual discovery' },
      { value: 'STRUCTURED', label: 'Structured - clear measurable plan', labelEn: 'Structured - clear measurable plan' },
      { value: 'FLEXIBLE', label: 'Flexible - based on what comes up', labelEn: 'Flexible - based on what comes up' },
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
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'thread-2',
    patientId: mockPatient.id,
    therapistId: 'therapist-5',
    subject: 'Initial consultation inquiry',
    lastMessageAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'thread-3',
    patientId: mockPatient.id,
    therapistId: 'therapist-4',
    subject: 'Session feedback',
    lastMessageAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
];

export const mockMessages: MockMessage[] = [
  // Thread 1 — ongoing conversation with Dr. Rachel Cohen
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: mockPatient.userId,
    senderRole: 'PATIENT',
    content: 'Thank you for the session today. I had a question about the exercise you recommended.',
    readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    senderId: 'user-therapist-1',
    senderRole: 'THERAPIST',
    content: 'Of course! Feel free to ask. The breathing exercise should be done twice daily for 5 minutes — once in the morning and once before bed.',
    readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
  },
  {
    id: 'msg-3',
    threadId: 'thread-1',
    senderId: mockPatient.userId,
    senderRole: 'PATIENT',
    content: 'Got it. Should I keep a journal of how I feel after each exercise?',
    readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-4',
    threadId: 'thread-1',
    senderId: 'user-therapist-1',
    senderRole: 'THERAPIST',
    content: 'That would be very helpful! Write down a brief note about your mood before and after. We can review the patterns together in our next session.',
    readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-5',
    threadId: 'thread-1',
    senderId: mockPatient.userId,
    senderRole: 'PATIENT',
    content: 'I\'ve been doing the exercises for a few days now. I noticed I feel calmer in the mornings but the evening ones are harder to stick to.',
    readAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'msg-6',
    threadId: 'thread-1',
    senderId: 'user-therapist-1',
    senderRole: 'THERAPIST',
    content: 'That\'s great progress! It\'s completely normal for evenings to be harder — your mind is more active. Try pairing the exercise with something you already do, like right after brushing your teeth. We\'ll discuss more strategies on Sunday.',
    readAt: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  // Thread 2 — conversation with Noa Sharon
  {
    id: 'msg-7',
    threadId: 'thread-2',
    senderId: mockPatient.userId,
    senderRole: 'PATIENT',
    content: 'Hi Dr. Sharon, I saw your profile on MatchMind and I\'m interested in learning more about your approach to stress management.',
    readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-8',
    threadId: 'thread-2',
    senderId: 'user-therapist-5',
    senderRole: 'THERAPIST',
    content: 'Hello Israel! Thank you for reaching out. I use an integrative approach combining mindfulness techniques with cognitive restructuring. Would you like to schedule a brief introductory call to see if we\'re a good fit?',
    readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-9',
    threadId: 'thread-2',
    senderId: mockPatient.userId,
    senderRole: 'PATIENT',
    content: 'That sounds great! I\'m available most mornings. What days work best for you?',
    readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000),
  },
  {
    id: 'msg-10',
    threadId: 'thread-2',
    senderId: 'user-therapist-5',
    senderRole: 'THERAPIST',
    content: 'I have openings on Tuesday and Thursday mornings. Would 10:00 AM work for you? It would be a 20-minute introductory video call, no charge.',
    readAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  // Thread 3 — past conversation with Yossi Mizrahi
  {
    id: 'msg-11',
    threadId: 'thread-3',
    senderId: mockPatient.userId,
    senderRole: 'PATIENT',
    content: 'Thank you for the consultation session last week. I appreciate your insights on couples therapy.',
    readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-12',
    threadId: 'thread-3',
    senderId: 'user-therapist-4',
    senderRole: 'THERAPIST',
    content: 'You\'re welcome! It was great meeting you. As we discussed, I\'d recommend starting with individual sessions first before transitioning to couples work. Feel free to reach out whenever you\'re ready to schedule.',
    readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-13',
    threadId: 'thread-3',
    senderId: mockPatient.userId,
    senderRole: 'PATIENT',
    content: 'That makes sense. I\'ll discuss it with my partner and get back to you. Thanks again!',
    readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];
