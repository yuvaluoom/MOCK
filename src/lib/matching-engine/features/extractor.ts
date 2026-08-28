/**
 * MatchMind Matching Engine - Feature Extractor
 *
 * Transforms raw patient and therapist data into structured features
 * for the scoring algorithm. Separates raw data from derived signals.
 */

import type {
  PatientProfile,
  XFactorProfile,
  TherapistProfile,
  PatientFeatures,
  TherapistFeatures,
  DerivedFeatures,
  ExtractedFeatures,
  LocationFeature,
  HealthFundFeature,
  TherapeuticNeedProfile,
  ConstraintProfile,
  PreferenceProfile,
  ExpertiseProfile,
  AvailabilityProfile,
  CapacityProfile,
  ScheduleConstraint,
  IFeatureExtractor,
} from '../types';

// =============================================================================
// FEATURE EXTRACTOR IMPLEMENTATION
// =============================================================================

export class FeatureExtractor implements IFeatureExtractor {
  /**
   * Extract all features from patient profile and X-Factor
   */
  extractPatientFeatures(
    patient: PatientProfile,
    xFactor: XFactorProfile
  ): PatientFeatures {
    return {
      location: this.extractPatientLocation(patient),
      healthFundFeature: this.extractPatientHealthFund(patient),
      therapeuticNeedProfile: this.extractTherapeuticNeeds(xFactor),
      constraintProfile: this.extractConstraints(patient, xFactor),
      preferenceProfile: this.extractPreferences(patient),
    };
  }

  /**
   * Extract all features from therapist profile
   */
  extractTherapistFeatures(therapist: TherapistProfile): TherapistFeatures {
    return {
      location: this.extractTherapistLocation(therapist),
      healthFundFeature: this.extractTherapistHealthFund(therapist),
      expertiseProfile: this.extractExpertise(therapist),
      availabilityProfile: this.extractAvailability(therapist),
      capacityProfile: this.extractCapacity(therapist),
    };
  }

  /**
   * Compute derived features from patient and therapist features
   */
  computeDerivedFeatures(
    patient: PatientFeatures,
    therapist: TherapistFeatures
  ): DerivedFeatures {
    return {
      distanceKm: this.computeDistance(patient.location, therapist.location),
      scheduleOverlapScore: this.computeScheduleOverlap(
        patient.constraintProfile.scheduleConstraints,
        therapist.availabilityProfile
      ),
      expertiseMatchScore: this.computeExpertiseMatch(
        patient.therapeuticNeedProfile,
        therapist.expertiseProfile
      ),
      communicationStyleAlignment: this.computeCommunicationAlignment(
        patient.therapeuticNeedProfile,
        therapist.expertiseProfile
      ),
    };
  }

  // ===========================================================================
  // PATIENT FEATURE EXTRACTION
  // ===========================================================================

  private extractPatientLocation(patient: PatientProfile): LocationFeature {
    return {
      city: patient.city,
      region: patient.region,
      coordinates: patient.coordinates,
      prefersOnline: patient.preferredOnline,
      prefersInPerson: !patient.preferredOnline,
      maxTravelDistance: patient.maxTravelDistance,
    };
  }

  private extractPatientHealthFund(patient: PatientProfile): HealthFundFeature {
    const organizationCodes = patient.organizationMemberships
      ?.filter(m => m.isActive)
      .map(m => m.organizationCode) ?? [];

    return {
      primaryFund: patient.healthFund,
      acceptedFunds: patient.healthFund ? [patient.healthFund] : [],
      organizationCodes,
      acceptsPrivate: !patient.healthFund || patient.healthFund === 'PRIVATE',
    };
  }

  private extractTherapeuticNeeds(xFactor: XFactorProfile): TherapeuticNeedProfile {
    // High structure need: structurePreference > 60
    const needsHighStructure = xFactor.structurePreference > 60;

    // High emotional support: emotionalIntensity > 65
    const needsEmotionalSupport = xFactor.emotionalIntensity > 65;

    // Directive approach: relationshipStyle < 40
    const needsDirectiveApproach = xFactor.relationshipStyle < 40;

    // Verbal processing: communicationStyle > 60
    const needsVerbalProcessing = xFactor.communicationStyle > 60;

    // Trauma indicators: high stress + low coping
    const traumaIndicators =
      (xFactor.stressLevel ?? 50) > 70 ||
      (xFactor.emotionalLoad ?? 50) > 70;

    // Military related needs: militaryStress > 50
    const militaryRelatedNeeds = (xFactor.militaryStress ?? 0) > 50;

    // Sleep issues: sleepQuality < 40
    const sleepIssues = (xFactor.sleepQuality ?? 50) < 40;

    // High stress: stressLevel > 70
    const highStress = (xFactor.stressLevel ?? 50) > 70;

    // Overall intensity: composite of multiple factors
    const overallIntensity = this.computeNeedIntensity(xFactor);

    return {
      needsHighStructure,
      needsEmotionalSupport,
      needsDirectiveApproach,
      needsVerbalProcessing,
      traumaIndicators,
      militaryRelatedNeeds,
      sleepIssues,
      highStress,
      overallIntensity,
    };
  }

  private computeNeedIntensity(xFactor: XFactorProfile): number {
    // Composite score based on various intensity indicators
    const factors = [
      xFactor.emotionalIntensity / 100,
      (xFactor.stressLevel ?? 50) / 100,
      (xFactor.emotionalLoad ?? 50) / 100,
      (xFactor.militaryStress ?? 0) / 100,
      (100 - (xFactor.sleepQuality ?? 50)) / 100, // Inverted
    ];

    return Math.min(100, (factors.reduce((a, b) => a + b, 0) / factors.length) * 100);
  }

  private extractConstraints(
    patient: PatientProfile,
    xFactor: XFactorProfile
  ): ConstraintProfile {
    // Hard constraints
    const healthFundRequired = !!patient.healthFund && patient.healthFund !== 'PRIVATE';
    const onlineOnly = patient.preferredOnline && !patient.maxTravelDistance;
    const inPersonOnly = !patient.preferredOnline && patient.maxTravelDistance === 0;
    const specificCityRequired = inPersonOnly && !!patient.city;

    // Schedule constraints
    const scheduleConstraints: ScheduleConstraint[] = [{
      preferredDays: patient.preferredDays,
      preferredTimeStart: patient.preferredTimeStart,
      preferredTimeEnd: patient.preferredTimeEnd,
    }];

    // Flexibility scores (from X-Factor if available, otherwise defaults)
    const geographicFlexibility = xFactor.geographicFlexibility ?? (patient.preferredOnline ? 80 : 50);
    const scheduleFlexibility = xFactor.scheduleFlexibility ?? 50;
    const budgetFlexibility = xFactor.budgetFlexibility ?? (patient.maxSessionPrice ? 30 : 70);

    return {
      healthFundRequired,
      onlineOnly,
      inPersonOnly,
      specificCityRequired,
      genderPreference: patient.preferredGender,
      languageRequirements: patient.preferredLanguages,
      maxPrice: patient.maxSessionPrice,
      scheduleConstraints,
      geographicFlexibility,
      scheduleFlexibility,
      budgetFlexibility,
    };
  }

  private extractPreferences(patient: PatientProfile): PreferenceProfile {
    return {
      preferredApproaches: patient.preferredApproaches,
      preferredSpecializations: [], // Could be expanded
      preferredGender: patient.preferredGender,
      preferredExperienceLevel: undefined, // Could be added to patient profile

      // Importance weights (could be from questionnaire)
      approachImportance: patient.preferredApproaches.length > 0 ? 0.7 : 0.3,
      experienceImportance: 0.5,
      genderImportance: patient.preferredGender ? 0.8 : 0.2,
    };
  }

  // ===========================================================================
  // THERAPIST FEATURE EXTRACTION
  // ===========================================================================

  private extractTherapistLocation(therapist: TherapistProfile): LocationFeature {
    return {
      city: therapist.city,
      region: therapist.region,
      coordinates: therapist.coordinates,
      prefersOnline: therapist.offersOnline,
      prefersInPerson: therapist.offersInPerson,
      maxTravelDistance: therapist.serviceRadius,
    };
  }

  private extractTherapistHealthFund(therapist: TherapistProfile): HealthFundFeature {
    const organizationCodes = therapist.organizationAffiliations
      ?.filter(a => a.isActive)
      .map(a => a.organizationCode) ?? [];

    const acceptsPrivate = therapist.acceptedHealthFunds.includes('PRIVATE') ||
                          !!therapist.sessionPrice;

    return {
      primaryFund: undefined, // Therapists don't have a primary fund
      acceptedFunds: therapist.acceptedHealthFunds,
      organizationCodes,
      acceptsPrivate,
    };
  }

  private extractExpertise(therapist: TherapistProfile): ExpertiseProfile {
    // Determine experience level
    let experienceLevel: 'junior' | 'mid' | 'senior';
    if (therapist.yearsOfExperience >= 10) {
      experienceLevel = 'senior';
    } else if (therapist.yearsOfExperience >= 5) {
      experienceLevel = 'mid';
    } else {
      experienceLevel = 'junior';
    }

    // Primary approach (first one listed, or most common in practice)
    const primaryApproach = therapist.approaches[0];

    // Primary specializations (top 3)
    const primarySpecializations = therapist.specializations.slice(0, 3);

    // Specific expertise flags
    const traumaExpertise = therapist.specializations.some(s =>
      ['TRAUMA_PTSD', 'MILITARY_VETERANS', 'GRIEF'].includes(s)
    ) || therapist.approaches.includes('EMDR');

    const militaryExpertise = therapist.specializations.includes('MILITARY_VETERANS');

    const childrenExpertise = therapist.specializations.some(s =>
      ['CHILDREN', 'ADOLESCENTS', 'PLAY_THERAPY'].includes(s)
    );

    return {
      approaches: therapist.approaches,
      specializations: therapist.specializations,
      primaryApproach,
      primarySpecializations,
      yearsOfExperience: therapist.yearsOfExperience,
      experienceLevel,
      traumaExpertise,
      militaryExpertise,
      childrenExpertise,
    };
  }

  private extractAvailability(therapist: TherapistProfile): AvailabilityProfile {
    const slots = therapist.availability;

    const onlineSlots = slots.filter(s => s.isOnline).length;
    const inPersonSlots = slots.filter(s => s.isInPerson).length;

    // Count slots by day
    const slotsByDay: Record<string, number> = {};
    for (const slot of slots) {
      slotsByDay[slot.dayOfWeek] = (slotsByDay[slot.dayOfWeek] || 0) + 1;
    }

    // Check for evening slots (after 17:00)
    const hasEveningSlots = slots.some(s => {
      const hour = parseInt(s.startTime.split(':')[0], 10);
      return hour >= 17;
    });

    // Check for weekend slots (Friday evening or Saturday in Israel)
    const hasWeekendSlots = slots.some(s =>
      s.dayOfWeek === 'FRIDAY' || s.dayOfWeek === 'SATURDAY'
    );

    return {
      totalWeeklySlots: slots.length,
      onlineSlots,
      inPersonSlots,
      slotsByDay,
      offersBothFormats: onlineSlots > 0 && inPersonSlots > 0,
      hasEveningSlots,
      hasWeekendSlots,
    };
  }

  private extractCapacity(therapist: TherapistProfile): CapacityProfile {
    const currentLoad = therapist.maxWeeklyPatients
      ? therapist.currentPatientCount / therapist.maxWeeklyPatients
      : 0.5; // Assume 50% if unknown

    // Estimate wait time based on load
    let estimatedWaitTime: number | undefined;
    if (currentLoad >= 0.9) {
      estimatedWaitTime = 30; // ~1 month wait
    } else if (currentLoad >= 0.7) {
      estimatedWaitTime = 14; // ~2 weeks wait
    } else if (currentLoad >= 0.5) {
      estimatedWaitTime = 7; // ~1 week wait
    }

    // Response speed from performance metrics
    const responseSpeed: 'fast' | 'normal' | 'slow' =
      (therapist.performanceMetrics?.responseTimeHours ?? 48) <= 24 ? 'fast' :
      (therapist.performanceMetrics?.responseTimeHours ?? 48) <= 48 ? 'normal' : 'slow';

    return {
      isAccepting: therapist.isAcceptingPatients,
      currentLoad,
      estimatedWaitTime,
      responseSpeed,
    };
  }

  // ===========================================================================
  // DERIVED FEATURE COMPUTATION
  // ===========================================================================

  private computeDistance(
    patientLocation: LocationFeature,
    therapistLocation: LocationFeature
  ): number | undefined {
    // If both have coordinates, compute actual distance
    if (patientLocation.coordinates && therapistLocation.coordinates) {
      return this.haversineDistance(
        patientLocation.coordinates.lat,
        patientLocation.coordinates.lng,
        therapistLocation.coordinates.lat,
        therapistLocation.coordinates.lng
      );
    }

    // If same city, assume 5km average
    if (patientLocation.city === therapistLocation.city) {
      return 5;
    }

    // If same region, assume 30km average
    if (patientLocation.region && patientLocation.region === therapistLocation.region) {
      return 30;
    }

    // Different region or unknown
    return undefined;
  }

  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private computeScheduleOverlap(
    constraints: ScheduleConstraint[],
    availability: AvailabilityProfile
  ): number {
    if (constraints.length === 0 || availability.totalWeeklySlots === 0) {
      return 50; // Neutral score if no constraints
    }

    const constraint = constraints[0];
    if (constraint.preferredDays.length === 0) {
      return 70; // Good score if no specific day preference
    }

    // Count matching slots
    let matchingSlots = 0;
    for (const day of constraint.preferredDays) {
      matchingSlots += availability.slotsByDay[day] || 0;
    }

    // Score based on matching slots (0-100)
    const matchRatio = matchingSlots / availability.totalWeeklySlots;
    return Math.min(100, Math.round(matchRatio * 100 + 20)); // Baseline + match bonus
  }

  private computeExpertiseMatch(
    needs: TherapeuticNeedProfile,
    expertise: ExpertiseProfile
  ): number {
    let score = 50; // Baseline

    // Trauma match
    if (needs.traumaIndicators && expertise.traumaExpertise) {
      score += 20;
    }

    // Military match (very important in Israel)
    if (needs.militaryRelatedNeeds && expertise.militaryExpertise) {
      score += 25;
    }

    // Structure preference alignment
    if (needs.needsHighStructure) {
      // CBT, DBT are structured approaches
      if (expertise.approaches.some(a => ['CBT', 'DBT', 'SOLUTION_FOCUSED'].includes(a))) {
        score += 15;
      }
    } else {
      // Psychodynamic, Humanistic are less structured
      if (expertise.approaches.some(a => ['PSYCHODYNAMIC', 'HUMANISTIC', 'GESTALT'].includes(a))) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  private computeCommunicationAlignment(
    needs: TherapeuticNeedProfile,
    expertise: ExpertiseProfile
  ): number {
    let score = 60; // Baseline - most therapists are adaptable

    // Verbal processing preference
    if (needs.needsVerbalProcessing) {
      // Most talk therapy approaches are verbal
      if (expertise.approaches.some(a => ['CBT', 'PSYCHODYNAMIC', 'NARRATIVE'].includes(a))) {
        score += 15;
      }
    } else {
      // Non-verbal approaches
      if (expertise.approaches.some(a => ['ART_THERAPY', 'SOMATIC', 'MINDFULNESS'].includes(a))) {
        score += 20;
      }
    }

    // Directive vs collaborative style
    if (needs.needsDirectiveApproach) {
      if (expertise.approaches.some(a => ['CBT', 'DBT', 'SOLUTION_FOCUSED'].includes(a))) {
        score += 10;
      }
    } else {
      if (expertise.approaches.some(a => ['HUMANISTIC', 'GESTALT', 'NARRATIVE'].includes(a))) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createFeatureExtractor(): IFeatureExtractor {
  return new FeatureExtractor();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract all features for a patient-therapist pair
 */
export function extractAllFeatures(
  patient: PatientProfile,
  xFactor: XFactorProfile,
  therapist: TherapistProfile
): ExtractedFeatures {
  const extractor = createFeatureExtractor();

  const patientFeatures = extractor.extractPatientFeatures(patient, xFactor);
  const therapistFeatures = extractor.extractTherapistFeatures(therapist);
  const derivedFeatures = extractor.computeDerivedFeatures(patientFeatures, therapistFeatures);

  return {
    patientFeatures,
    therapistFeatures,
    derivedFeatures,
  };
}
