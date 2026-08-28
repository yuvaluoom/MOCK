/**
 * MatchMind Matching Engine - Explainability System
 *
 * Generates human-readable explanations for match scores.
 * Produces insights, reasons, concerns, and explanations in Hebrew and English.
 */

import type {
  IExplainer,
  PatientProfile,
  TherapistProfile,
  ExtractedFeatures,
  MatchScore,
  MatchExplanation,
  MatchReason,
  MatchConcern,
  MatchInsight,
  ComponentExplanation,
} from '../types';

// =============================================================================
// EXPLAINER IMPLEMENTATION
// =============================================================================

export class Explainer implements IExplainer {

  /**
   * Generate a comprehensive explanation for a match
   */
  generateExplanation(
    features: ExtractedFeatures,
    score: MatchScore,
    patient: PatientProfile,
    therapist: TherapistProfile
  ): MatchExplanation {
    const topReasons = this.generateReasons(features, score, therapist);
    const concerns = this.generateConcerns(features, score);
    const insights = this.generateInsights(features, score, therapist);
    const componentExplanations = this.generateComponentExplanations(score);
    const { summaryEn, summaryHe } = this.generateSummary(score, topReasons, concerns, therapist);

    return {
      summaryEn,
      summaryHe,
      topReasons,
      concerns,
      insights,
      componentExplanations,
    };
  }

  /**
   * Generate the summary sentence for the match
   */
  private generateSummary(
    score: MatchScore,
    reasons: MatchReason[],
    concerns: MatchConcern[],
    therapist: TherapistProfile
  ): { summaryEn: string; summaryHe: string } {
    const therapistName = `${therapist.firstName} ${therapist.lastName}`;
    const qualityHebrew = this.getQualityInHebrew(score.quality);
    const qualityEnglish = score.quality.charAt(0).toUpperCase() + score.quality.slice(1);

    const topReason = reasons.length > 0 ? reasons[0] : null;
    const topConcern = concerns.length > 0 ? concerns[0] : null;

    let summaryHe = `${therapistName} הוא Match ${qualityHebrew} (${score.overall}%) עבורך`;
    let summaryEn = `${therapistName} is a ${qualityEnglish} match (${score.overall}%) for you`;

    if (topReason) {
      summaryHe += ` - ${topReason.reasonHe}`;
      summaryEn += ` - ${topReason.reasonEn}`;
    }

    if (topConcern && score.overall < 70) {
      summaryHe += `. Note: ${topConcern.concernHe}`;
      summaryEn += `. Note: ${topConcern.concernEn}`;
    }

    return { summaryEn, summaryHe };
  }

  // ===========================================================================
  // REASON GENERATION
  // ===========================================================================

  private generateReasons(
    features: ExtractedFeatures,
    score: MatchScore,
    therapist: TherapistProfile
  ): MatchReason[] {
    const reasons: MatchReason[] = [];
    const components = score.components;

    // X-Factor reasons
    if (components.xFactor.score >= 70) {
      reasons.push({
        category: 'xFactor',
        reasonEn: 'Strong psychological compatibility based on your therapeutic needs',
        reasonHe: 'Match פסיכולוגית גבוהה על בסיס הצרכs הTherapyיs Your',
        importance: 'high',
        icon: '🧠',
      });
    }

    // Health fund reasons
    if (components.healthFund.score >= 80) {
      reasons.push({
        category: 'healthFund',
        reasonEn: 'Accepts your health fund for covered treatment',
        reasonHe: 'accepts the health fund Your לTherapy בהשתתOptions עצמית',
        importance: 'high',
        icon: '💳',
      });
    }

    // Availability reasons
    if (components.availability.score >= 70) {
      reasons.push({
        category: 'availability',
        reasonEn: 'Good schedule compatibility with your preferences',
        reasonHe: 'Good Match ללוח הזמנs Your',
        importance: 'medium',
        icon: '📅',
      });
    }

    // Location reasons
    if (components.location.score >= 80) {
      const distance = features.derivedFeatures.distanceKm;
      if (distance !== undefined && distance <= 10) {
        reasons.push({
          category: 'location',
          reasonEn: `Conveniently located nearby (${Math.round(distance)}km)`,
          reasonHe: `מedקם בקרבת מקום (${Math.round(distance)} ק"מ)`,
          importance: 'medium',
          icon: '📍',
        });
      } else if (therapist.offersOnline) {
        reasons.push({
          category: 'location',
          reasonEn: 'Offers online sessions for your convenience',
          reasonHe: 'Offers therapy Online לנוחsך',
          importance: 'medium',
          icon: '💻',
        });
      }
    }

    // Expertise match
    if (features.therapistFeatures.expertiseProfile.traumaExpertise &&
        features.patientFeatures.therapeuticNeedProfile.traumaIndicators) {
      reasons.push({
        category: 'expertise',
        reasonEn: 'Specialized in trauma therapy matching your needs',
        reasonHe: 'מתמחה בTherapy בTrauma בהתאם לצרכיך',
        importance: 'high',
        icon: '🎯',
      });
    }

    // Military expertise
    if (features.therapistFeatures.expertiseProfile.militaryExpertise &&
        features.patientFeatures.therapeuticNeedProfile.militaryRelatedNeeds) {
      reasons.push({
        category: 'expertise',
        reasonEn: 'Experience treating military and reserve service stress',
        reasonHe: 'Experience בTherapy בלחצs צבאיs ומילואs',
        importance: 'high',
        icon: '🎖️',
      });
    }

    // Experience level for high-need patients
    if (features.patientFeatures.therapeuticNeedProfile.overallIntensity > 70 &&
        features.therapistFeatures.expertiseProfile.experienceLevel === 'senior') {
      reasons.push({
        category: 'experience',
        reasonEn: `${therapist.yearsOfExperience} years of experience for complex needs`,
        reasonHe: `${therapist.yearsOfExperience} years experience לTherapy בצרכs edרכבs`,
        importance: 'medium',
        icon: '⭐',
      });
    }

    // Sort by importance and limit
    const importanceOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return reasons
      .sort((a, b) => importanceOrder[b.importance] - importanceOrder[a.importance])
      .slice(0, 4);
  }

  // ===========================================================================
  // CONCERN GENERATION
  // ===========================================================================

  private generateConcerns(
    features: ExtractedFeatures,
    score: MatchScore
  ): MatchConcern[] {
    const concerns: MatchConcern[] = [];
    const components = score.components;

    // Health fund concern
    if (components.healthFund.score < 50) {
      concerns.push({
        category: 'healthFund',
        concernEn: 'Health fund not accepted - private payment required',
        concernHe: 'the health fund No מתקבלת - Required תHello Private',
        severity: 'warning',
        suggestion: 'Consider checking partial reimbursement options',
        suggestionHe: 'Recommended לReview אפשרs להחזר חלקי מהקופה',
      });
    }

    // Availability concern
    if (components.availability.score < 50) {
      concerns.push({
        category: 'availability',
        concernEn: 'Limited schedule overlap with your preferences',
        concernHe: 'חפיפה edגבלת בלוח הזמנs להup toyour',
        severity: 'info',
        suggestion: 'Consider flexible scheduling or online sessions',
        suggestionHe: 'שקול Flexibility inזמנs or Therapy Online',
      });
    }

    // Location concern
    const distance = features.derivedFeatures.distanceKm;
    if (components.location.score < 50 && distance !== undefined && distance > 30) {
      concerns.push({
        category: 'location',
        concernEn: `Located ${Math.round(distance)}km away - may be inconvenient`,
        concernHe: `מedקם במרחק ${Math.round(distance)} ק"מ - עלול להיs No נוח`,
        severity: 'info',
        suggestion: 'Consider online sessions as an alternative',
        suggestionHe: 'שקול Therapy Online כחלופה',
      });
    }

    // Capacity concern
    if (!features.therapistFeatures.capacityProfile.isAccepting) {
      concerns.push({
        category: 'capacity',
        concernEn: 'Therapist is not currently accepting new patients',
        concernHe: 'הTherapist No מקבל Patients חדשs כרגע',
        severity: 'warning',
        suggestion: 'You can request to be added to their waitlist',
        suggestionHe: 'ניתן לבקש להיכנס לרשימת המתנה',
      });
    } else if (features.therapistFeatures.capacityProfile.currentLoad > 0.9) {
      concerns.push({
        category: 'capacity',
        concernEn: 'Therapist has very limited availability',
        concernHe: 'לTherapist Availability edגבלת מorד',
        severity: 'info',
        suggestion: 'Contact soon to secure a spot',
        suggestionHe: 'Recommended לפנs בהקדם להבטחת מקום',
      });
    }

    // X-Factor concern
    if (components.xFactor.score < 50) {
      concerns.push({
        category: 'xFactor',
        concernEn: 'Therapeutic style may not be an ideal match',
        concernHe: 'סגנון הTherapy עשוי להיs No מתאs במלוor',
        severity: 'info',
        suggestion: 'Consider scheduling an introductory session first',
        suggestionHe: 'Recommended לקיs פגישת היכרs לבחינת הMatch',
      });
    }

    return concerns.slice(0, 3);
  }

  // ===========================================================================
  // INSIGHT GENERATION
  // ===========================================================================

  private generateInsights(
    features: ExtractedFeatures,
    score: MatchScore,
    therapist: TherapistProfile
  ): MatchInsight[] {
    const insights: MatchInsight[] = [];
    const expertise = features.therapistFeatures.expertiseProfile;
    const availability = features.therapistFeatures.availabilityProfile;

    // Experience insight
    if (therapist.yearsOfExperience >= 10) {
      insights.push({
        insightEn: `${therapist.yearsOfExperience} years of professional experience`,
        insightHe: `${therapist.yearsOfExperience} years experience מקצועי`,
        type: 'context',
      });
    }

    // Both formats available
    if (availability.offersBothFormats) {
      insights.push({
        insightEn: 'Offers both online and in-person sessions',
        insightHe: 'Offers therapy orOnline וIn-Person',
        type: 'compatibility',
      });
    }

    // Evening availability
    if (availability.hasEveningSlots) {
      insights.push({
        insightEn: 'Evening appointments available',
        insightHe: 'Sessions Availability בשעs הערב',
        type: 'compatibility',
      });
    }

    // Fast response
    if (features.therapistFeatures.capacityProfile.responseSpeed === 'fast') {
      insights.push({
        insightEn: 'Typically responds to inquiries quickly',
        insightHe: 'מגיב לפניs במהירs',
        type: 'recommendation',
      });
    }

    // Approach recommendation
    if (expertise.primaryApproach) {
      const approachHe = this.translateApproach(expertise.primaryApproach);
      insights.push({
        insightEn: `Primary approach: ${expertise.primaryApproach}`,
        insightHe: `גישה עיקרית: ${approachHe}`,
        type: 'context',
      });
    }

    return insights.slice(0, 4);
  }

  // ===========================================================================
  // COMPONENT EXPLANATION GENERATION
  // ===========================================================================

  private generateComponentExplanations(score: MatchScore): ComponentExplanation[] {
    const explanations: ComponentExplanation[] = [];
    const components = score.components;

    // X-Factor explanation
    explanations.push({
      component: 'xFactor',
      score: components.xFactor.score,
      explanationEn: 'Psychological compatibility based on your therapeutic preferences and needs',
      explanationHe: 'Match פסיכולוגית על בסיס הup toyour וצרכיך הTherapyיs',
      details: components.xFactor.positiveFactors,
      detailsHe: components.xFactor.positiveFactors.map(f => this.translateFactor(f)),
    });

    // Health fund explanation
    explanations.push({
      component: 'healthFund',
      score: components.healthFund.score,
      explanationEn: 'Health fund coverage and payment options',
      explanationHe: 'Coverage Health Fund ואפשרויs תHello',
      details: components.healthFund.positiveFactors,
      detailsHe: components.healthFund.positiveFactors.map(f => this.translateFactor(f)),
    });

    // Availability explanation
    explanations.push({
      component: 'availability',
      score: components.availability.score,
      explanationEn: 'Schedule compatibility and therapist capacity',
      explanationHe: 'התאמת Schedule וAvailability הTherapist',
      details: components.availability.positiveFactors,
      detailsHe: components.availability.positiveFactors.map(f => this.translateFactor(f)),
    });

    // Location explanation
    explanations.push({
      component: 'location',
      score: components.location.score,
      explanationEn: 'Location convenience and session format options',
      explanationHe: 'נוחs Location ואפשרויs Format הSession',
      details: components.location.positiveFactors,
      detailsHe: components.location.positiveFactors.map(f => this.translateFactor(f)),
    });

    // Preferences explanation
    explanations.push({
      component: 'preferences',
      score: components.preferences.score,
      explanationEn: 'Match with your stated preferences',
      explanationHe: 'Match להup toOptions שציינת',
      details: components.preferences.positiveFactors,
      detailsHe: components.preferences.positiveFactors.map(f => this.translateFactor(f)),
    });

    return explanations;
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private getQualityInHebrew(quality: string): string {
    const qualityMap: Record<string, string> = {
      excellent: 'מעולה',
      great: 'Goodה מorד',
      good: 'Goodה',
      moderate: 'Moderateה',
      low: 'נedכה',
    };
    return qualityMap[quality] || quality;
  }

  private translateApproach(approach: string): string {
    const approachMap: Record<string, string> = {
      CBT: 'Therapy Cognitive Behavioral',
      DBT: 'Therapy דיאלקטי-התנהגsי',
      PSYCHODYNAMIC: 'גישה Psychodynamicת',
      HUMANISTIC: 'גישה Humanisticת',
      GESTALT: 'גשטלט',
      EMDR: 'EMDR',
      MINDFULNESS: 'Mindfulness',
      SOLUTION_FOCUSED: 'גישה מedקדת פתרון',
      NARRATIVE: 'Therapy נרטיבי',
      ART_THERAPY: 'Art therapy',
      SOMATIC: 'Therapy סומטי',
    };
    return approachMap[approach] || approach;
  }

  private translateFactor(factor: string): string {
    // Simple translations for common factors
    const translations: Record<string, string> = {
      'Structured therapy approaches match need for structure': 'Therapeutic approaches edבנs מתאימs לצורך Your במבנה',
      'Flexible therapy approaches match preference': 'Therapeutic approaches גמישs מתאימs להup toyour',
      'Trauma expertise matches therapeutic needs': 'edמחיs בTrauma מתאימה לצרכיך הTherapyיs',
      'Specialized in military/veteran mental health': 'מתמחה בבריorת נפשית של חיילs ומשרתי מילואs',
      'Compatible communication styles': 'סגנונs תקשורת תואמs',
      'Experienced therapist for complex needs': 'Therapist מנוTotal לצרכs edרכבs',
      'Good schedule availability match': 'Good Match בAvailability',
      'Good availability for new patients': 'Availability Goodה לPatients חדשs',
      'Typically responds quickly': 'מגיב בדרך כלל במהירs',
      'Offers both online and in-person options': 'Offers therapy orOnline וIn-Person',
      'Online sessions available': 'Therapy Online זGender',
      'Same city': 'orתה City',
      'Private pay option available': 'אפשרs תHello Private זמינה',
    };
    return translations[factor] || factor;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createExplainer(): IExplainer {
  return new Explainer();
}
