import Anthropic from '@anthropic-ai/sdk';
import type {
  MockTherapist,
  MockPatient,
  MockXFactorProfile,
} from '@/server/mock-data';

const client = new Anthropic();

export interface AIMatchInsight {
  compatibilityNarrative: string;
  strengthAreas: string[];
  potentialChallenges: string[];
  therapeuticRationale: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  adjustedScore: number;
}

export interface AIPatientProfile {
  psychologicalSummary: string;
  coreNeeds: string[];
  therapeuticRecommendations: string[];
  riskFactors: string[];
  idealTherapistTraits: string[];
}

function buildPatientContext(
  patient: MockPatient,
  xFactor: MockXFactorProfile | null
): string {
  const parts: string[] = [];

  parts.push(`Patient: ${patient.firstName}, age: ${patient.age ?? 'unknown'}`);
  parts.push(`City: ${patient.city || 'unspecified'}`);
  parts.push(`Health fund: ${patient.healthFund}`);
  parts.push(`Preferred languages: ${(patient.preferredLanguages || ['he']).join(', ')}`);
  parts.push(`Session preference: ${patient.preferredOnline ? 'Online' : 'In-person or flexible'}`);

  if (patient.maritalStatus) parts.push(`Marital status: ${patient.maritalStatus}`);
  if (patient.militaryService) parts.push(`Military service: ${patient.militaryService}`);
  if (patient.workStatus) parts.push(`Work status: ${patient.workStatus}`);

  if (xFactor) {
    parts.push(`\nPsychological Profile (X-Factor):`);
    parts.push(`- Emotional intensity: ${xFactor.emotionalIntensity}/100`);
    parts.push(`- Openness to new approaches: ${xFactor.openness}/100`);
    parts.push(`- Structure preference: ${xFactor.structurePreference}/100 (100=very structured)`);
    parts.push(`- Change readiness: ${xFactor.changeReadiness}/100`);
    parts.push(`- Communication style score: ${xFactor.communicationStyle}/100`);
    parts.push(`- Relationship style: ${xFactor.relationshipStyle}/100`);

    if (xFactor.stressLevel != null) {
      parts.push(`- Current stress level: ${xFactor.stressLevel}/100`);
    }
    if (xFactor.emotionalLoad != null) {
      parts.push(`- Emotional load: ${xFactor.emotionalLoad}/100`);
    }
    if (xFactor.sleepQuality != null) {
      parts.push(`- Sleep quality: ${xFactor.sleepQuality}/100`);
    }
    if (xFactor.militaryStress != null) {
      parts.push(`- Military-related stress: ${xFactor.militaryStress}/100`);
    }
    if (xFactor.communicationStylePreference) {
      parts.push(`- Communication style preference: ${xFactor.communicationStylePreference}`);
    }
    if (xFactor.emotionalNeeds) {
      parts.push(`- Emotional needs: ${xFactor.emotionalNeeds.join(', ')}`);
    }
    if (xFactor.therapyStylePreference) {
      parts.push(`- Therapy style preference: ${xFactor.therapyStylePreference}`);
    }
  }

  if (patient.preferredApproaches && patient.preferredApproaches.length > 0) {
    parts.push(`\nPreferred therapeutic approaches: ${patient.preferredApproaches.join(', ')}`);
  }

  return parts.join('\n');
}

function buildTherapistContext(therapist: MockTherapist): string {
  const parts: string[] = [];

  parts.push(`Therapist: ${therapist.firstName} ${therapist.lastName}`);
  parts.push(`Title: ${therapist.title || 'Clinical Psychologist'}`);
  parts.push(`City: ${therapist.city}`);
  parts.push(`Years of experience: ${therapist.yearsOfExperience}`);
  parts.push(`Languages: ${therapist.languages.join(', ')}`);
  parts.push(`Therapeutic approaches: ${therapist.approaches.join(', ')}`);
  parts.push(`Specializations: ${therapist.specializations.join(', ')}`);
  parts.push(`Health funds: ${therapist.acceptedHealthFunds.join(', ')}`);
  parts.push(`Session format: ${[therapist.offersOnline ? 'online' : '', therapist.offersInPerson ? 'in-person' : ''].filter(Boolean).join(' & ')}`);
  parts.push(`Session price: ₪${therapist.sessionPrice}`);
  parts.push(`Session duration: ${therapist.sessionDuration} minutes`);

  if (therapist.bio) {
    parts.push(`\nBio: ${therapist.bio}`);
  }

  return parts.join('\n');
}

export async function analyzeMatchWithAI(
  patient: MockPatient,
  xFactor: MockXFactorProfile | null,
  therapist: MockTherapist,
  algorithmScore: number
): Promise<AIMatchInsight> {
  const patientCtx = buildPatientContext(patient, xFactor);
  const therapistCtx = buildTherapistContext(therapist);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are MatchMind's clinical matching AI. You analyze patient-therapist compatibility for a mental health matching platform in Israel.

Your job is to provide a brief, professional clinical assessment of the match quality between a patient and therapist based on their profiles.

Respond in valid JSON only with this exact structure:
{
  "compatibilityNarrative": "2-3 sentence professional assessment of the match",
  "strengthAreas": ["strength 1", "strength 2", "strength 3"],
  "potentialChallenges": ["challenge 1"],
  "therapeuticRationale": "1-2 sentences explaining WHY this match works or doesn't from a clinical perspective",
  "confidenceLevel": "high" | "medium" | "low",
  "scoreAdjustment": number between -10 and +10
}

Be concise. Focus on clinically meaningful insights that a heuristic algorithm would miss — therapeutic approach fit, personality compatibility, treatment modality alignment. scoreAdjustment reflects whether AI analysis suggests the algorithmic score should be adjusted up or down.`,
      messages: [
        {
          role: 'user',
          content: `Analyze this match (algorithm score: ${algorithmScore}/100):

PATIENT PROFILE:
${patientCtx}

THERAPIST PROFILE:
${therapistCtx}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return fallbackInsight(algorithmScore);
    }

    const parsed = JSON.parse(textBlock.text);
    return {
      compatibilityNarrative: parsed.compatibilityNarrative || '',
      strengthAreas: parsed.strengthAreas || [],
      potentialChallenges: parsed.potentialChallenges || [],
      therapeuticRationale: parsed.therapeuticRationale || '',
      confidenceLevel: parsed.confidenceLevel || 'medium',
      adjustedScore: Math.min(100, Math.max(0, algorithmScore + (parsed.scoreAdjustment || 0))),
    };
  } catch {
    return fallbackInsight(algorithmScore);
  }
}

export async function analyzePatientProfile(
  patient: MockPatient,
  xFactor: MockXFactorProfile | null
): Promise<AIPatientProfile> {
  const patientCtx = buildPatientContext(patient, xFactor);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are MatchMind's clinical profiling AI for a mental health matching platform in Israel.

Analyze the patient's questionnaire data and psychological profile to produce a clinical summary that will guide therapist matching.

Respond in valid JSON only:
{
  "psychologicalSummary": "3-4 sentence clinical summary of the patient's profile and needs",
  "coreNeeds": ["need 1", "need 2", "need 3"],
  "therapeuticRecommendations": ["recommendation 1", "recommendation 2"],
  "riskFactors": ["risk factor if any"],
  "idealTherapistTraits": ["trait 1", "trait 2", "trait 3"]
}

Be professional and clinically grounded. Focus on actionable insights for matching.`,
      messages: [
        {
          role: 'user',
          content: `Analyze this patient profile for matching purposes:\n\n${patientCtx}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return fallbackProfile();
    }

    return JSON.parse(textBlock.text);
  } catch {
    return fallbackProfile();
  }
}

export async function batchAnalyzeMatches(
  patient: MockPatient,
  xFactor: MockXFactorProfile | null,
  therapists: Array<{ therapist: MockTherapist; algorithmScore: number }>
): Promise<Map<string, AIMatchInsight>> {
  const patientCtx = buildPatientContext(patient, xFactor);
  const results = new Map<string, AIMatchInsight>();

  const therapistSummaries = therapists
    .slice(0, 10)
    .map((t, i) => `--- Therapist ${i + 1} (ID: ${t.therapist.id}, algo score: ${t.algorithmScore}) ---\n${buildTherapistContext(t.therapist)}`)
    .join('\n\n');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: `You are MatchMind's clinical matching AI for a mental health matching platform in Israel.

Analyze the compatibility between one patient and multiple therapists. For each therapist, provide a brief clinical assessment.

Respond in valid JSON only — an array of objects:
[
  {
    "therapistId": "the therapist ID",
    "compatibilityNarrative": "1-2 sentence assessment",
    "strengthAreas": ["strength 1", "strength 2"],
    "potentialChallenges": ["challenge if any"],
    "therapeuticRationale": "1 sentence clinical rationale",
    "confidenceLevel": "high" | "medium" | "low",
    "scoreAdjustment": number between -10 and +10
  }
]

Focus on clinically meaningful differences between the therapists. scoreAdjustment reflects whether the AI analysis suggests adjusting the algorithmic score.`,
      messages: [
        {
          role: 'user',
          content: `Analyze these matches:

PATIENT PROFILE:
${patientCtx}

THERAPISTS:
${therapistSummaries}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return results;
    }

    const parsed: Array<{
      therapistId: string;
      compatibilityNarrative: string;
      strengthAreas: string[];
      potentialChallenges: string[];
      therapeuticRationale: string;
      confidenceLevel: 'high' | 'medium' | 'low';
      scoreAdjustment: number;
    }> = JSON.parse(textBlock.text);

    for (const item of parsed) {
      const match = therapists.find((t) => t.therapist.id === item.therapistId);
      if (match) {
        results.set(item.therapistId, {
          compatibilityNarrative: item.compatibilityNarrative || '',
          strengthAreas: item.strengthAreas || [],
          potentialChallenges: item.potentialChallenges || [],
          therapeuticRationale: item.therapeuticRationale || '',
          confidenceLevel: item.confidenceLevel || 'medium',
          adjustedScore: Math.min(100, Math.max(0, match.algorithmScore + (item.scoreAdjustment || 0))),
        });
      }
    }
  } catch {
    // Silently fall back - AI insights are additive, not critical
  }

  return results;
}

function fallbackInsight(score: number): AIMatchInsight {
  return {
    compatibilityNarrative: 'AI analysis is currently unavailable. Match score is based on algorithmic assessment.',
    strengthAreas: [],
    potentialChallenges: [],
    therapeuticRationale: '',
    confidenceLevel: 'low',
    adjustedScore: score,
  };
}

function fallbackProfile(): AIPatientProfile {
  return {
    psychologicalSummary: 'AI profiling is currently unavailable.',
    coreNeeds: [],
    therapeuticRecommendations: [],
    riskFactors: [],
    idealTherapistTraits: [],
  };
}
