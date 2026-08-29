/**
 * MatchMind Matching Engine - Scorer
 *
 * Multi-dimensional scoring algorithm with configurable weights.
 * Produces normalized scores with detailed breakdowns for explainability.
 */

import type {
  ExtractedFeatures,
  MatchingConfig,
  MatchScore,
  MatchScoreComponents,
  ComponentScore,
  ScoreBreakdownItem,
  ConstraintSatisfactionResult,
  ConstraintViolation,
  PartialConstraint,
  MatchQuality,
  IScorer,
} from '../types';

// =============================================================================
// SCORER IMPLEMENTATION
// =============================================================================

export class Scorer implements IScorer {
  /**
   * Compute comprehensive match score
   */
  computeScore(
    features: ExtractedFeatures,
    config: MatchingConfig
  ): MatchScore {
    // Check constraints first
    const constraintResult = this.checkConstraints(features, config);

    // Compute component scores
    const components = this.computeComponents(features, config);

    // Calculate overall score
    const overall = this.computeOverallScore(components, constraintResult, config);

    // Determine quality level
    const quality = this.determineQuality(overall, config);

    // Calculate confidence
    const confidence = this.computeConfidence(features, components);

    return {
      overall,
      quality,
      components,
      constraintSatisfaction: constraintResult,
      confidence,
    };
  }

  // ===========================================================================
  // CONSTRAINT CHECKING
  // ===========================================================================

  private checkConstraints(
    features: ExtractedFeatures,
    config: MatchingConfig
  ): ConstraintSatisfactionResult {
    const satisfied: string[] = [];
    const unsatisfied: ConstraintViolation[] = [];
    const partial: PartialConstraint[] = [];

    const { patientFeatures, therapistFeatures, derivedFeatures } = features;
    const constraints = patientFeatures.constraintProfile;

    // Health fund constraint (hard)
    if (constraints.healthFundRequired) {
      const patientFund = patientFeatures.healthFundFeature.primaryFund;
      const hasMatch = patientFund &&
        therapistFeatures.healthFundFeature.acceptedFunds.includes(patientFund);

      if (hasMatch) {
        satisfied.push('health_fund');
      } else {
        unsatisfied.push({
          constraintType: 'health_fund',
          description: 'Therapist does not accept patient\'s health fund',
          descriptionHe: 'Therapist does not accept the patient\'s health fund',
          severity: 'hard',
          impact: 50,
        });
      }
    } else {
      satisfied.push('health_fund');
    }

    // Location constraint
    if (constraints.onlineOnly) {
      if (therapistFeatures.location.prefersOnline) {
        satisfied.push('online_availability');
      } else {
        unsatisfied.push({
          constraintType: 'online_availability',
          description: 'Therapist does not offer online sessions',
          descriptionHe: 'Therapist does not offer online sessions',
          severity: 'hard',
          impact: 40,
        });
      }
    } else if (constraints.inPersonOnly) {
      if (therapistFeatures.location.prefersInPerson) {
        const distance = derivedFeatures.distanceKm;
        const maxDistance = constraints.maxPrice ?? 50;

        if (distance === undefined || distance <= maxDistance) {
          satisfied.push('in_person_location');
        } else {
          partial.push({
            constraintType: 'in_person_location',
            satisfactionLevel: Math.max(0, 1 - (distance - maxDistance) / maxDistance),
            description: `Therapist is ${Math.round(distance)}km away (max: ${maxDistance}km)`,
            descriptionHe: `Therapist is ${Math.round(distance)} km away (max: ${maxDistance} km)`,
          });
        }
      } else {
        unsatisfied.push({
          constraintType: 'in_person_availability',
          description: 'Therapist does not offer in-person sessions',
          descriptionHe: 'Therapist does not offer in-person sessions',
          severity: 'hard',
          impact: 40,
        });
      }
    } else {
      satisfied.push('location_flexibility');
    }

    // Gender preference (soft)
    if (constraints.genderPreference) {
      // This would need therapist gender - assuming it's available
      const therapistGender = 'UNKNOWN'; // Would come from therapist profile
      if (therapistGender === constraints.genderPreference) {
        satisfied.push('gender_preference');
      } else if (therapistGender !== 'UNKNOWN') {
        partial.push({
          constraintType: 'gender_preference',
          satisfactionLevel: 0.5,
          description: 'Therapist gender does not match preference',
          descriptionHe: 'Therapist gender does not match preference',
        });
      }
    }

    // Language requirement (soft)
    if (constraints.languageRequirements.length > 0) {
      const therapistLanguages = therapistFeatures.expertiseProfile.approaches; // Would be languages
      const hasLanguage = constraints.languageRequirements.some(lang =>
        therapistLanguages.includes(lang)
      );

      if (hasLanguage) {
        satisfied.push('language_match');
      } else {
        partial.push({
          constraintType: 'language_match',
          satisfactionLevel: 0.3,
          description: 'Preferred language not available',
          descriptionHe: 'Preferred language not available',
        });
      }
    }

    // Budget constraint
    if (constraints.maxPrice !== undefined) {
      const therapistPrice = 400; // Would come from therapist profile
      if (therapistPrice <= constraints.maxPrice) {
        satisfied.push('budget');
      } else {
        const overage = (therapistPrice - constraints.maxPrice) / constraints.maxPrice;
        partial.push({
          constraintType: 'budget',
          satisfactionLevel: Math.max(0, 1 - overage),
          description: `Session price (₪${therapistPrice}) exceeds budget (₪${constraints.maxPrice})`,
          descriptionHe: `Session price (₪${therapistPrice}) exceeds budget (₪${constraints.maxPrice})`,
        });
      }
    }

    // Capacity constraint (therapist accepting new patients)
    if (!therapistFeatures.capacityProfile.isAccepting) {
      unsatisfied.push({
        constraintType: 'capacity',
        description: 'Therapist is not accepting new patients',
        descriptionHe: 'Therapist is not accepting new patients',
        severity: 'soft',
        impact: 30,
      });
    } else {
      satisfied.push('capacity');
    }

    return {
      allSatisfied: unsatisfied.length === 0,
      satisfiedConstraints: satisfied,
      unsatisfiedConstraints: unsatisfied,
      partiallyMetConstraints: partial,
    };
  }

  // ===========================================================================
  // COMPONENT SCORING
  // ===========================================================================

  private computeComponents(
    features: ExtractedFeatures,
    config: MatchingConfig
  ): MatchScoreComponents {
    return {
      xFactor: this.computeXFactorScore(features, config),
      healthFund: this.computeHealthFundScore(features, config),
      availability: this.computeAvailabilityScore(features, config),
      location: this.computeLocationScore(features, config),
      preferences: this.computePreferencesScore(features, config),
    };
  }

  private computeXFactorScore(
    features: ExtractedFeatures,
    config: MatchingConfig
  ): ComponentScore {
    const weight = config.weights.xFactor;
    const needs = features.patientFeatures.therapeuticNeedProfile;
    const expertise = features.therapistFeatures.expertiseProfile;
    const derived = features.derivedFeatures;

    const breakdown: ScoreBreakdownItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];

    // Structure alignment
    let structureScore = 50;
    if (needs.needsHighStructure) {
      if (expertise.approaches.some(a => ['CBT', 'DBT', 'SOLUTION_FOCUSED'].includes(a))) {
        structureScore = 90;
        positiveFactors.push('Structured therapy approaches match need for structure');
      }
    } else {
      if (expertise.approaches.some(a => ['PSYCHODYNAMIC', 'HUMANISTIC', 'GESTALT'].includes(a))) {
        structureScore = 85;
        positiveFactors.push('Flexible therapy approaches match preference');
      }
    }
    breakdown.push({
      key: 'structure',
      label: 'Structure Alignment',
      labelHe: 'Structure match',
      score: structureScore,
      maxScore: 100,
      contribution: structureScore * 0.2,
    });

    // Trauma/military expertise
    let traumaScore = 50;
    if (needs.traumaIndicators || needs.militaryRelatedNeeds) {
      if (expertise.traumaExpertise) {
        traumaScore += 25;
        positiveFactors.push('Trauma expertise matches therapeutic needs');
      }
      if (needs.militaryRelatedNeeds && expertise.militaryExpertise) {
        traumaScore += 30;
        positiveFactors.push('Specialized in military/veteran mental health');
      }
      if (!expertise.traumaExpertise && !expertise.militaryExpertise) {
        traumaScore = 30;
        negativeFactors.push('May benefit from trauma-specialized therapist');
      }
    }
    breakdown.push({
      key: 'trauma_expertise',
      label: 'Specialized Expertise',
      labelHe: 'Special expertise',
      score: Math.min(100, traumaScore),
      maxScore: 100,
      contribution: traumaScore * 0.25,
    });

    // Communication style alignment
    const commScore = derived.communicationStyleAlignment;
    breakdown.push({
      key: 'communication',
      label: 'Communication Style',
      labelHe: 'Communication style',
      score: commScore,
      maxScore: 100,
      contribution: commScore * 0.2,
    });
    if (commScore >= 70) {
      positiveFactors.push('Compatible communication styles');
    }

    // Expertise match
    const expertiseScore = derived.expertiseMatchScore;
    breakdown.push({
      key: 'expertise_match',
      label: 'Expertise Match',
      labelHe: 'Expertise match',
      score: expertiseScore,
      maxScore: 100,
      contribution: expertiseScore * 0.2,
    });

    // Experience level
    let experienceScore = 60;
    if (needs.overallIntensity > 70 && expertise.experienceLevel === 'senior') {
      experienceScore = 90;
      positiveFactors.push('Experienced therapist for complex needs');
    } else if (needs.overallIntensity <= 50 && expertise.experienceLevel === 'junior') {
      experienceScore = 70;
    }
    breakdown.push({
      key: 'experience',
      label: 'Experience Level',
      labelHe: 'Experience level',
      score: experienceScore,
      maxScore: 100,
      contribution: experienceScore * 0.15,
    });

    // Calculate total
    const totalScore = breakdown.reduce((sum, item) => sum + item.contribution, 0) /
                       breakdown.reduce((sum, item) => sum + (item.maxScore * (item.contribution / item.score)), 0) * 100;

    return {
      score: Math.round(totalScore),
      weight,
      weighted: Math.round(totalScore * weight),
      breakdown,
      positiveFactors,
      negativeFactors,
    };
  }

  private computeHealthFundScore(
    features: ExtractedFeatures,
    config: MatchingConfig
  ): ComponentScore {
    const weight = config.weights.healthFund;
    const patientFund = features.patientFeatures.healthFundFeature;
    const therapistFund = features.therapistFeatures.healthFundFeature;

    const breakdown: ScoreBreakdownItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];

    let fundScore = 0;

    // Check direct health fund match
    if (patientFund.primaryFund) {
      if (therapistFund.acceptedFunds.includes(patientFund.primaryFund)) {
        fundScore = 100;
        positiveFactors.push(`Accepts ${patientFund.primaryFund} health fund`);
      } else if (therapistFund.acceptsPrivate) {
        fundScore = 50;
        negativeFactors.push('Health fund not directly accepted, private pay available');
      } else {
        fundScore = 10;
        negativeFactors.push('Health fund not accepted');
      }
    } else {
      // Patient has no specific health fund requirement
      if (therapistFund.acceptsPrivate) {
        fundScore = 80;
        positiveFactors.push('Private pay option available');
      } else {
        fundScore = 60;
      }
    }

    breakdown.push({
      key: 'health_fund_match',
      label: 'Health Fund Coverage',
      labelHe: 'Coverage Health Fund',
      score: fundScore,
      maxScore: 100,
      contribution: fundScore,
    });

    // Check organization affiliations
    const patientOrgs = patientFund.organizationCodes;
    const therapistOrgs = therapistFund.organizationCodes;
    const orgMatch = patientOrgs.some(org => therapistOrgs.includes(org));

    if (orgMatch) {
      const orgBonus = 10;
      breakdown.push({
        key: 'organization_match',
        label: 'Organization Match',
        labelHe: 'Organization match',
        score: 100,
        maxScore: 100,
        contribution: orgBonus,
      });
      positiveFactors.push('Member of same healthcare organization');
      fundScore = Math.min(100, fundScore + orgBonus);
    }

    return {
      score: fundScore,
      weight,
      weighted: Math.round(fundScore * weight),
      breakdown,
      positiveFactors,
      negativeFactors,
    };
  }

  private computeAvailabilityScore(
    features: ExtractedFeatures,
    config: MatchingConfig
  ): ComponentScore {
    const weight = config.weights.availability;
    const constraints = features.patientFeatures.constraintProfile;
    const availability = features.therapistFeatures.availabilityProfile;
    const capacity = features.therapistFeatures.capacityProfile;
    const derived = features.derivedFeatures;

    const breakdown: ScoreBreakdownItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];

    // Schedule overlap
    const scheduleScore = derived.scheduleOverlapScore;
    breakdown.push({
      key: 'schedule_overlap',
      label: 'Schedule Compatibility',
      labelHe: 'Schedule match',
      score: scheduleScore,
      maxScore: 100,
      contribution: scheduleScore * 0.4,
    });
    if (scheduleScore >= 70) {
      positiveFactors.push('Good schedule availability match');
    } else if (scheduleScore < 40) {
      negativeFactors.push('Limited schedule overlap');
    }

    // Capacity/wait time
    let capacityScore = 100;
    if (!capacity.isAccepting) {
      capacityScore = 20;
      negativeFactors.push('Not currently accepting new patients');
    } else if (capacity.currentLoad > 0.9) {
      capacityScore = 40;
      negativeFactors.push('Very limited availability');
    } else if (capacity.currentLoad > 0.7) {
      capacityScore = 70;
    } else {
      positiveFactors.push('Good availability for new patients');
    }
    breakdown.push({
      key: 'capacity',
      label: 'Therapist Capacity',
      labelHe: 'Availability Therapist',
      score: capacityScore,
      maxScore: 100,
      contribution: capacityScore * 0.3,
    });

    // Response speed
    let responseScore = 70;
    if (capacity.responseSpeed === 'fast') {
      responseScore = 100;
      positiveFactors.push('Typically responds quickly');
    } else if (capacity.responseSpeed === 'slow') {
      responseScore = 40;
    }
    breakdown.push({
      key: 'response_speed',
      label: 'Response Time',
      labelHe: 'Response time',
      score: responseScore,
      maxScore: 100,
      contribution: responseScore * 0.15,
    });

    // Flexibility bonus
    let flexibilityScore = 50;
    if (availability.offersBothFormats) {
      flexibilityScore += 20;
      positiveFactors.push('Offers both online and in-person options');
    }
    if (availability.hasEveningSlots) {
      flexibilityScore += 15;
    }
    if (availability.hasWeekendSlots) {
      flexibilityScore += 15;
    }
    breakdown.push({
      key: 'flexibility',
      label: 'Format Flexibility',
      labelHe: 'Format flexibility',
      score: Math.min(100, flexibilityScore),
      maxScore: 100,
      contribution: flexibilityScore * 0.15,
    });

    const totalScore = breakdown.reduce((sum, item) => sum + item.contribution, 0);

    return {
      score: Math.round(totalScore),
      weight,
      weighted: Math.round(totalScore * weight),
      breakdown,
      positiveFactors,
      negativeFactors,
    };
  }

  private computeLocationScore(
    features: ExtractedFeatures,
    config: MatchingConfig
  ): ComponentScore {
    const weight = config.weights.location;
    const patientLocation = features.patientFeatures.location;
    const therapistLocation = features.therapistFeatures.location;
    const distance = features.derivedFeatures.distanceKm;

    const breakdown: ScoreBreakdownItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];

    let locationScore = 50;

    // Format compatibility
    const wantsOnline = patientLocation.prefersOnline;
    const wantsInPerson = patientLocation.prefersInPerson;
    const offersOnline = therapistLocation.prefersOnline;
    const offersInPerson = therapistLocation.prefersInPerson;

    if (wantsOnline && offersOnline) {
      locationScore = 90;
      positiveFactors.push('Online sessions available');
    } else if (wantsInPerson && offersInPerson) {
      // Check distance
      if (distance !== undefined) {
        const maxDist = patientLocation.maxTravelDistance ?? 30;
        if (distance <= maxDist * 0.5) {
          locationScore = 95;
          positiveFactors.push(`Very close location (${Math.round(distance)}km)`);
        } else if (distance <= maxDist) {
          locationScore = 80;
          positiveFactors.push(`Within travel distance (${Math.round(distance)}km)`);
        } else {
          // Apply distance decay
          const decayRate = config.parameters.distanceDecayRate;
          const decay = Math.max(0, 1 - (distance - maxDist) * decayRate);
          locationScore = Math.round(50 * decay);
          negativeFactors.push(`Location may be far (${Math.round(distance)}km)`);
        }
      } else if (patientLocation.city === therapistLocation.city) {
        locationScore = 85;
        positiveFactors.push('Same city');
      }
    } else if (offersOnline && offersInPerson) {
      locationScore = 75;
      positiveFactors.push('Flexible location options');
    } else {
      locationScore = 30;
      negativeFactors.push('Format preferences do not match');
    }

    breakdown.push({
      key: 'location_match',
      label: 'Location Match',
      labelHe: 'Location match',
      score: locationScore,
      maxScore: 100,
      contribution: locationScore,
    });

    return {
      score: locationScore,
      weight,
      weighted: Math.round(locationScore * weight),
      breakdown,
      positiveFactors,
      negativeFactors,
    };
  }

  private computePreferencesScore(
    features: ExtractedFeatures,
    config: MatchingConfig
  ): ComponentScore {
    const weight = config.weights.preferences;
    const prefs = features.patientFeatures.preferenceProfile;
    const expertise = features.therapistFeatures.expertiseProfile;

    const breakdown: ScoreBreakdownItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];

    // Approach preference match
    let approachScore = 50;
    if (prefs.preferredApproaches.length > 0) {
      const matchingApproaches = prefs.preferredApproaches.filter(a =>
        expertise.approaches.includes(a)
      );
      if (matchingApproaches.length > 0) {
        approachScore = 50 + (matchingApproaches.length / prefs.preferredApproaches.length) * 50;
        positiveFactors.push(`Offers preferred approach: ${matchingApproaches.join(', ')}`);
      } else {
        approachScore = 30;
        negativeFactors.push('Preferred therapy approaches not offered');
      }
    }
    breakdown.push({
      key: 'approach',
      label: 'Therapy Approach',
      labelHe: 'Therapeutic approach',
      score: Math.round(approachScore),
      maxScore: 100,
      contribution: approachScore * (prefs.approachImportance),
    });

    // Experience preference
    let experienceScore = 70;
    if (prefs.preferredExperienceLevel) {
      if (prefs.preferredExperienceLevel === expertise.experienceLevel) {
        experienceScore = 100;
      } else if (
        (prefs.preferredExperienceLevel === 'junior' && expertise.experienceLevel === 'mid') ||
        (prefs.preferredExperienceLevel === 'mid' && expertise.experienceLevel === 'senior')
      ) {
        experienceScore = 80; // Close match
      } else {
        experienceScore = 50;
      }
    }
    breakdown.push({
      key: 'experience',
      label: 'Experience Level',
      labelHe: 'Experience level',
      score: experienceScore,
      maxScore: 100,
      contribution: experienceScore * prefs.experienceImportance,
    });

    // Total weighted score
    const totalWeight = prefs.approachImportance + prefs.experienceImportance;
    const totalScore = breakdown.reduce((sum, item) => sum + item.contribution, 0) / totalWeight;

    return {
      score: Math.round(totalScore),
      weight,
      weighted: Math.round(totalScore * weight),
      breakdown,
      positiveFactors,
      negativeFactors,
    };
  }

  // ===========================================================================
  // OVERALL SCORE COMPUTATION
  // ===========================================================================

  private computeOverallScore(
    components: MatchScoreComponents,
    constraints: ConstraintSatisfactionResult,
    config: MatchingConfig
  ): number {
    // Base score from weighted components
    let baseScore =
      components.xFactor.weighted +
      components.healthFund.weighted +
      components.availability.weighted +
      components.location.weighted +
      components.preferences.weighted;

    // Apply constraint penalties
    for (const violation of constraints.unsatisfiedConstraints) {
      if (violation.severity === 'hard') {
        baseScore *= 0.5; // Hard violation halves the score
      } else {
        baseScore -= violation.impact * 0.1; // Soft violation reduces score
      }
    }

    // Apply partial constraint adjustments
    for (const partial of constraints.partiallyMetConstraints) {
      const adjustment = (1 - partial.satisfactionLevel) * 10;
      baseScore -= adjustment;
    }

    return Math.max(0, Math.min(100, Math.round(baseScore)));
  }

  private determineQuality(score: number, config: MatchingConfig): MatchQuality {
    const { thresholds } = config;

    if (score >= thresholds.excellent) return 'excellent';
    if (score >= thresholds.great) return 'great';
    if (score >= thresholds.good) return 'good';
    if (score >= thresholds.moderate) return 'moderate';
    return 'low';
  }

  private computeConfidence(
    features: ExtractedFeatures,
    components: MatchScoreComponents
  ): number {
    // Confidence based on data completeness and score consistency
    let confidence = 0.7; // Base confidence

    // Higher confidence if X-Factor profile is complete
    // This would check xFactor.isComplete in real implementation
    confidence += 0.1;

    // Higher confidence if scores are consistent (low variance)
    const scores = [
      components.xFactor.score,
      components.healthFund.score,
      components.availability.score,
      components.location.score,
      components.preferences.score,
    ];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 15) {
      confidence += 0.1; // Consistent scores
    } else if (stdDev > 30) {
      confidence -= 0.1; // Highly variable scores
    }

    return Math.max(0.3, Math.min(1.0, confidence));
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createScorer(): IScorer {
  return new Scorer();
}
