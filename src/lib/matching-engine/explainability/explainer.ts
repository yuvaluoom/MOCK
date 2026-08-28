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

    let summaryHe = `${therapistName} הוא התאמה ${qualityHebrew} (${score.overall}%) עבורך`;
    let summaryEn = `${therapistName} is a ${qualityEnglish} match (${score.overall}%) for you`;

    if (topReason) {
      summaryHe += ` - ${topReason.reasonHe}`;
      summaryEn += ` - ${topReason.reasonEn}`;
    }

    if (topConcern && score.overall < 70) {
      summaryHe += `. שים לב: ${topConcern.concernHe}`;
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
        reasonHe: 'התאמה פסיכולוגית גבוהה על בסיס הצרכים הטיפוליים שלך',
        importance: 'high',
        icon: '🧠',
      });
    }

    // Health fund reasons
    if (components.healthFund.score >= 80) {
      reasons.push({
        category: 'healthFund',
        reasonEn: 'Accepts your health fund for covered treatment',
        reasonHe: 'מקבל את קופת החולים שלך לטיפול בהשתתפות עצמית',
        importance: 'high',
        icon: '💳',
      });
    }

    // Availability reasons
    if (components.availability.score >= 70) {
      reasons.push({
        category: 'availability',
        reasonEn: 'Good schedule compatibility with your preferences',
        reasonHe: 'התאמה טובה ללוח הזמנים שלך',
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
          reasonHe: `ממוקם בקרבת מקום (${Math.round(distance)} ק"מ)`,
          importance: 'medium',
          icon: '📍',
        });
      } else if (therapist.offersOnline) {
        reasons.push({
          category: 'location',
          reasonEn: 'Offers online sessions for your convenience',
          reasonHe: 'מציע טיפול מקוון לנוחותך',
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
        reasonHe: 'מתמחה בטיפול בטראומה בהתאם לצרכיך',
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
        reasonHe: 'ניסיון בטיפול בלחצים צבאיים ומילואים',
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
        reasonHe: `${therapist.yearsOfExperience} שנות ניסיון לטיפול בצרכים מורכבים`,
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
        concernHe: 'קופת החולים לא מתקבלת - נדרש תשלום פרטי',
        severity: 'warning',
        suggestion: 'Consider checking partial reimbursement options',
        suggestionHe: 'מומלץ לבדוק אפשרות להחזר חלקי מהקופה',
      });
    }

    // Availability concern
    if (components.availability.score < 50) {
      concerns.push({
        category: 'availability',
        concernEn: 'Limited schedule overlap with your preferences',
        concernHe: 'חפיפה מוגבלת בלוח הזמנים להעדפותיך',
        severity: 'info',
        suggestion: 'Consider flexible scheduling or online sessions',
        suggestionHe: 'שקול גמישות בזמנים או טיפול מקוון',
      });
    }

    // Location concern
    const distance = features.derivedFeatures.distanceKm;
    if (components.location.score < 50 && distance !== undefined && distance > 30) {
      concerns.push({
        category: 'location',
        concernEn: `Located ${Math.round(distance)}km away - may be inconvenient`,
        concernHe: `ממוקם במרחק ${Math.round(distance)} ק"מ - עלול להיות לא נוח`,
        severity: 'info',
        suggestion: 'Consider online sessions as an alternative',
        suggestionHe: 'שקול טיפול מקוון כחלופה',
      });
    }

    // Capacity concern
    if (!features.therapistFeatures.capacityProfile.isAccepting) {
      concerns.push({
        category: 'capacity',
        concernEn: 'Therapist is not currently accepting new patients',
        concernHe: 'המטפל לא מקבל מטופלים חדשים כרגע',
        severity: 'warning',
        suggestion: 'You can request to be added to their waitlist',
        suggestionHe: 'ניתן לבקש להיכנס לרשימת המתנה',
      });
    } else if (features.therapistFeatures.capacityProfile.currentLoad > 0.9) {
      concerns.push({
        category: 'capacity',
        concernEn: 'Therapist has very limited availability',
        concernHe: 'למטפל זמינות מוגבלת מאוד',
        severity: 'info',
        suggestion: 'Contact soon to secure a spot',
        suggestionHe: 'מומלץ לפנות בהקדם להבטחת מקום',
      });
    }

    // X-Factor concern
    if (components.xFactor.score < 50) {
      concerns.push({
        category: 'xFactor',
        concernEn: 'Therapeutic style may not be an ideal match',
        concernHe: 'סגנון הטיפול עשוי להיות לא מתאים במלואו',
        severity: 'info',
        suggestion: 'Consider scheduling an introductory session first',
        suggestionHe: 'מומלץ לקיים פגישת היכרות לבחינת ההתאמה',
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
        insightHe: `${therapist.yearsOfExperience} שנות ניסיון מקצועי`,
        type: 'context',
      });
    }

    // Both formats available
    if (availability.offersBothFormats) {
      insights.push({
        insightEn: 'Offers both online and in-person sessions',
        insightHe: 'מציע טיפול אונליין ופרונטלי',
        type: 'compatibility',
      });
    }

    // Evening availability
    if (availability.hasEveningSlots) {
      insights.push({
        insightEn: 'Evening appointments available',
        insightHe: 'פגישות זמינות בשעות הערב',
        type: 'compatibility',
      });
    }

    // Fast response
    if (features.therapistFeatures.capacityProfile.responseSpeed === 'fast') {
      insights.push({
        insightEn: 'Typically responds to inquiries quickly',
        insightHe: 'מגיב לפניות במהירות',
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
      explanationHe: 'התאמה פסיכולוגית על בסיס העדפותיך וצרכיך הטיפוליים',
      details: components.xFactor.positiveFactors,
      detailsHe: components.xFactor.positiveFactors.map(f => this.translateFactor(f)),
    });

    // Health fund explanation
    explanations.push({
      component: 'healthFund',
      score: components.healthFund.score,
      explanationEn: 'Health fund coverage and payment options',
      explanationHe: 'כיסוי קופת חולים ואפשרויות תשלום',
      details: components.healthFund.positiveFactors,
      detailsHe: components.healthFund.positiveFactors.map(f => this.translateFactor(f)),
    });

    // Availability explanation
    explanations.push({
      component: 'availability',
      score: components.availability.score,
      explanationEn: 'Schedule compatibility and therapist capacity',
      explanationHe: 'התאמת לוח זמנים וזמינות המטפל',
      details: components.availability.positiveFactors,
      detailsHe: components.availability.positiveFactors.map(f => this.translateFactor(f)),
    });

    // Location explanation
    explanations.push({
      component: 'location',
      score: components.location.score,
      explanationEn: 'Location convenience and session format options',
      explanationHe: 'נוחות מיקום ואפשרויות פורמט הפגישה',
      details: components.location.positiveFactors,
      detailsHe: components.location.positiveFactors.map(f => this.translateFactor(f)),
    });

    // Preferences explanation
    explanations.push({
      component: 'preferences',
      score: components.preferences.score,
      explanationEn: 'Match with your stated preferences',
      explanationHe: 'התאמה להעדפות שציינת',
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
      great: 'טובה מאוד',
      good: 'טובה',
      moderate: 'סבירה',
      low: 'נמוכה',
    };
    return qualityMap[quality] || quality;
  }

  private translateApproach(approach: string): string {
    const approachMap: Record<string, string> = {
      CBT: 'טיפול קוגניטיבי-התנהגותי',
      DBT: 'טיפול דיאלקטי-התנהגותי',
      PSYCHODYNAMIC: 'גישה פסיכודינמית',
      HUMANISTIC: 'גישה הומניסטית',
      GESTALT: 'גשטלט',
      EMDR: 'EMDR',
      MINDFULNESS: 'מיינדפולנס',
      SOLUTION_FOCUSED: 'גישה ממוקדת פתרון',
      NARRATIVE: 'טיפול נרטיבי',
      ART_THERAPY: 'טיפול באמנות',
      SOMATIC: 'טיפול סומטי',
    };
    return approachMap[approach] || approach;
  }

  private translateFactor(factor: string): string {
    // Simple translations for common factors
    const translations: Record<string, string> = {
      'Structured therapy approaches match need for structure': 'גישות טיפוליות מובנות מתאימות לצורך שלך במבנה',
      'Flexible therapy approaches match preference': 'גישות טיפוליות גמישות מתאימות להעדפותיך',
      'Trauma expertise matches therapeutic needs': 'מומחיות בטראומה מתאימה לצרכיך הטיפוליים',
      'Specialized in military/veteran mental health': 'מתמחה בבריאות נפשית של חיילים ומשרתי מילואים',
      'Compatible communication styles': 'סגנונות תקשורת תואמים',
      'Experienced therapist for complex needs': 'מטפל מנוסה לצרכים מורכבים',
      'Good schedule availability match': 'התאמה טובה בזמינות',
      'Good availability for new patients': 'זמינות טובה למטופלים חדשים',
      'Typically responds quickly': 'מגיב בדרך כלל במהירות',
      'Offers both online and in-person options': 'מציע טיפול אונליין ופרונטלי',
      'Online sessions available': 'טיפול מקוון זמין',
      'Same city': 'אותה עיר',
      'Private pay option available': 'אפשרות תשלום פרטי זמינה',
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
