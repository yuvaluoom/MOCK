/**
 * Behavioral Data Tracker
 *
 * Collects and manages behavioral signals for:
 * - User engagement patterns
 * - Session outcomes
 * - Platform interaction metrics
 *
 * This data feeds into:
 * - Internal scoring system
 * - Future ML models
 * - Analytics dashboards
 */

import type {
  UserEngagementMetrics,
  MatchOutcome,
  TherapistPerformanceMetrics,
} from '../core/types';
import { getInternalScorer } from '../scoring/internal-scorer';

// ============================================================================
// EVENT TYPES
// ============================================================================

export type BehavioralEventType =
  // Match Events
  | 'MATCH_VIEWED'
  | 'MATCH_FAVORITED'
  | 'MATCH_UNFAVORITED'
  | 'MATCH_HIDDEN'
  | 'MATCH_UNHIDDEN'
  // Therapist Events
  | 'THERAPIST_PROFILE_VIEWED'
  | 'THERAPIST_CONTACTED'
  // Session Events
  | 'SESSION_REQUESTED'
  | 'SESSION_BOOKED'
  | 'SESSION_COMPLETED'
  | 'SESSION_CANCELLED'
  | 'SESSION_NO_SHOW'
  // Feedback Events
  | 'FEEDBACK_SUBMITTED'
  | 'RATING_GIVEN'
  // Engagement Events
  | 'QUESTIONNAIRE_STARTED'
  | 'QUESTIONNAIRE_COMPLETED'
  | 'XFACTOR_STARTED'
  | 'XFACTOR_COMPLETED'
  | 'MESSAGE_SENT'
  | 'MESSAGE_READ';

export interface BehavioralEvent {
  type: BehavioralEventType;
  userId: string;
  userRole: 'PATIENT' | 'THERAPIST';
  timestamp: Date;
  data: Record<string, any>;
}

// ============================================================================
// IN-MEMORY EVENT STORE
// ============================================================================

const eventStore: BehavioralEvent[] = [];
const MAX_EVENTS = 10000; // Limit for memory

// ============================================================================
// BEHAVIORAL TRACKER CLASS
// ============================================================================

class BehavioralTracker {
  private static instance: BehavioralTracker;
  private internalScorer = getInternalScorer();

  private constructor() {}

  public static getInstance(): BehavioralTracker {
    if (!BehavioralTracker.instance) {
      BehavioralTracker.instance = new BehavioralTracker();
    }
    return BehavioralTracker.instance;
  }

  // ---------------------------------------------------------------------------
  // EVENT TRACKING
  // ---------------------------------------------------------------------------

  /**
   * Track a behavioral event
   */
  trackEvent(event: Omit<BehavioralEvent, 'timestamp'>): void {
    const fullEvent: BehavioralEvent = {
      ...event,
      timestamp: new Date(),
    };

    // Store event
    this.storeEvent(fullEvent);

    // Process event for real-time updates
    this.processEvent(fullEvent);
  }

  /**
   * Track match view
   */
  trackMatchView(userId: string, matchId: string, therapistId: string): void {
    this.trackEvent({
      type: 'MATCH_VIEWED',
      userId,
      userRole: 'PATIENT',
      data: { matchId, therapistId },
    });
  }

  /**
   * Track match favorite
   */
  trackMatchFavorite(userId: string, matchId: string, therapistId: string): void {
    this.trackEvent({
      type: 'MATCH_FAVORITED',
      userId,
      userRole: 'PATIENT',
      data: { matchId, therapistId },
    });
  }

  /**
   * Track therapist profile view
   */
  trackProfileView(userId: string, therapistId: string): void {
    this.trackEvent({
      type: 'THERAPIST_PROFILE_VIEWED',
      userId,
      userRole: 'PATIENT',
      data: { therapistId },
    });
  }

  /**
   * Track therapist contact
   */
  trackTherapistContact(
    userId: string,
    therapistId: string,
    matchScore?: number
  ): void {
    this.trackEvent({
      type: 'THERAPIST_CONTACTED',
      userId,
      userRole: 'PATIENT',
      data: { therapistId, matchScore },
    });
  }

  /**
   * Track session outcome
   */
  trackSessionOutcome(
    clientId: string,
    therapistId: string,
    outcome: {
      status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
      rating?: number;
      feedbackText?: string;
    }
  ): void {
    const eventType: BehavioralEventType =
      outcome.status === 'COMPLETED'
        ? 'SESSION_COMPLETED'
        : outcome.status === 'CANCELLED'
        ? 'SESSION_CANCELLED'
        : 'SESSION_NO_SHOW';

    this.trackEvent({
      type: eventType,
      userId: clientId,
      userRole: 'PATIENT',
      data: {
        therapistId,
        rating: outcome.rating,
        feedbackText: outcome.feedbackText,
      },
    });
  }

  /**
   * Track message sent
   */
  trackMessage(
    senderId: string,
    senderRole: 'PATIENT' | 'THERAPIST',
    receiverId: string
  ): void {
    this.trackEvent({
      type: 'MESSAGE_SENT',
      userId: senderId,
      userRole: senderRole,
      data: { receiverId },
    });
  }

  /**
   * Track questionnaire completion
   */
  trackQuestionnaireComplete(userId: string, type: 'INTAKE' | 'XFACTOR'): void {
    this.trackEvent({
      type: type === 'INTAKE' ? 'QUESTIONNAIRE_COMPLETED' : 'XFACTOR_COMPLETED',
      userId,
      userRole: 'PATIENT',
      data: {},
    });
  }

  // ---------------------------------------------------------------------------
  // EVENT PROCESSING
  // ---------------------------------------------------------------------------

  private storeEvent(event: BehavioralEvent): void {
    eventStore.push(event);

    // Limit memory usage
    if (eventStore.length > MAX_EVENTS) {
      eventStore.shift();
    }
  }

  private processEvent(event: BehavioralEvent): void {
    // Update internal scorer based on event type
    switch (event.type) {
      case 'MATCH_VIEWED':
        this.internalScorer.recordEngagementEvent(event.userId, {
          matchViewCount: 1,
        });
        break;

      case 'MATCH_FAVORITED':
        this.internalScorer.recordEngagementEvent(event.userId, {
          matchesFavorited: 1,
        });
        break;

      case 'THERAPIST_PROFILE_VIEWED':
        this.internalScorer.recordEngagementEvent(event.userId, {
          profileViewCount: 1,
        });
        break;

      case 'THERAPIST_CONTACTED':
        this.internalScorer.recordEngagementEvent(event.userId, {
          therapistsContacted: 1,
        });
        break;

      case 'MESSAGE_SENT':
        this.internalScorer.recordEngagementEvent(event.userId, {
          messagesSent: 1,
        });
        break;

      case 'SESSION_COMPLETED':
        this.internalScorer.recordEngagementEvent(event.userId, {
          totalSessionsCompleted: 1,
        });
        // Update therapist metrics
        this.updateTherapistFromSession(event.data.therapistId, {
          completed: true,
          rating: event.data.rating,
        });
        break;

      case 'SESSION_CANCELLED':
        this.internalScorer.recordEngagementEvent(event.userId, {
          totalSessionsCancelled: 1,
        });
        break;
    }
  }

  private updateTherapistFromSession(
    therapistId: string,
    outcome: { completed: boolean; rating?: number }
  ): void {
    // This would recalculate therapist metrics
    // Simplified for now
    if (outcome.rating) {
      // Would update average rating
    }
  }

  // ---------------------------------------------------------------------------
  // ANALYTICS QUERIES
  // ---------------------------------------------------------------------------

  /**
   * Get user engagement summary
   */
  getUserEngagement(userId: string): UserEngagementSummary {
    const userEvents = eventStore.filter((e) => e.userId === userId);

    return {
      totalEvents: userEvents.length,
      matchViews: userEvents.filter((e) => e.type === 'MATCH_VIEWED').length,
      profileViews: userEvents.filter((e) => e.type === 'THERAPIST_PROFILE_VIEWED').length,
      therapistsContacted: userEvents.filter((e) => e.type === 'THERAPIST_CONTACTED').length,
      sessionsCompleted: userEvents.filter((e) => e.type === 'SESSION_COMPLETED').length,
      sessionsCancelled: userEvents.filter((e) => e.type === 'SESSION_CANCELLED').length,
      messagesSent: userEvents.filter((e) => e.type === 'MESSAGE_SENT').length,
      lastActivityAt: userEvents.length > 0
        ? userEvents[userEvents.length - 1].timestamp
        : null,
    };
  }

  /**
   * Get therapist engagement summary
   */
  getTherapistEngagement(therapistId: string): TherapistEngagementSummary {
    const relatedEvents = eventStore.filter(
      (e) => e.data.therapistId === therapistId
    );

    return {
      totalProfileViews: relatedEvents.filter(
        (e) => e.type === 'THERAPIST_PROFILE_VIEWED'
      ).length,
      totalInquiries: relatedEvents.filter(
        (e) => e.type === 'THERAPIST_CONTACTED'
      ).length,
      totalSessionsCompleted: relatedEvents.filter(
        (e) => e.type === 'SESSION_COMPLETED'
      ).length,
      totalSessionsCancelled: relatedEvents.filter(
        (e) => e.type === 'SESSION_CANCELLED'
      ).length,
      averageRating: this.calculateAverageRating(relatedEvents),
    };
  }

  /**
   * Get conversion funnel stats
   */
  getConversionFunnel(): ConversionFunnel {
    const matchViews = new Set(
      eventStore
        .filter((e) => e.type === 'MATCH_VIEWED')
        .map((e) => `${e.userId}-${e.data.therapistId}`)
    ).size;

    const profileViews = new Set(
      eventStore
        .filter((e) => e.type === 'THERAPIST_PROFILE_VIEWED')
        .map((e) => `${e.userId}-${e.data.therapistId}`)
    ).size;

    const contacts = new Set(
      eventStore
        .filter((e) => e.type === 'THERAPIST_CONTACTED')
        .map((e) => `${e.userId}-${e.data.therapistId}`)
    ).size;

    const sessionsBooked = new Set(
      eventStore
        .filter((e) => e.type === 'SESSION_BOOKED')
        .map((e) => `${e.userId}-${e.data.therapistId}`)
    ).size;

    const sessionsCompleted = new Set(
      eventStore
        .filter((e) => e.type === 'SESSION_COMPLETED')
        .map((e) => `${e.userId}-${e.data.therapistId}`)
    ).size;

    return {
      matchViews,
      profileViews,
      contacts,
      sessionsBooked,
      sessionsCompleted,
      viewToProfileRate: matchViews > 0 ? profileViews / matchViews : 0,
      profileToContactRate: profileViews > 0 ? contacts / profileViews : 0,
      contactToBookRate: contacts > 0 ? sessionsBooked / contacts : 0,
      bookToCompleteRate: sessionsBooked > 0 ? sessionsCompleted / sessionsBooked : 0,
    };
  }

  private calculateAverageRating(events: BehavioralEvent[]): number | null {
    const ratings = events
      .filter((e) => e.type === 'SESSION_COMPLETED' && e.data.rating)
      .map((e) => e.data.rating as number);

    if (ratings.length === 0) return null;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }

  // ---------------------------------------------------------------------------
  // DATA EXPORT (for ML training)
  // ---------------------------------------------------------------------------

  /**
   * Export events for ML training
   */
  exportForTraining(
    startDate?: Date,
    endDate?: Date
  ): Array<{
    eventType: string;
    userId: string;
    data: Record<string, any>;
    timestamp: string;
  }> {
    return eventStore
      .filter((e) => {
        if (startDate && e.timestamp < startDate) return false;
        if (endDate && e.timestamp > endDate) return false;
        return true;
      })
      .map((e) => ({
        eventType: e.type,
        userId: e.userId,
        data: e.data,
        timestamp: e.timestamp.toISOString(),
      }));
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface UserEngagementSummary {
  totalEvents: number;
  matchViews: number;
  profileViews: number;
  therapistsContacted: number;
  sessionsCompleted: number;
  sessionsCancelled: number;
  messagesSent: number;
  lastActivityAt: Date | null;
}

interface TherapistEngagementSummary {
  totalProfileViews: number;
  totalInquiries: number;
  totalSessionsCompleted: number;
  totalSessionsCancelled: number;
  averageRating: number | null;
}

interface ConversionFunnel {
  matchViews: number;
  profileViews: number;
  contacts: number;
  sessionsBooked: number;
  sessionsCompleted: number;
  viewToProfileRate: number;
  profileToContactRate: number;
  contactToBookRate: number;
  bookToCompleteRate: number;
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const behavioralTracker = BehavioralTracker.getInstance();

// Convenience functions
export function trackMatchView(
  userId: string,
  matchId: string,
  therapistId: string
): void {
  behavioralTracker.trackMatchView(userId, matchId, therapistId);
}

export function trackProfileView(userId: string, therapistId: string): void {
  behavioralTracker.trackProfileView(userId, therapistId);
}

export function trackTherapistContact(
  userId: string,
  therapistId: string,
  matchScore?: number
): void {
  behavioralTracker.trackTherapistContact(userId, therapistId, matchScore);
}

export function getConversionStats(): ConversionFunnel {
  return behavioralTracker.getConversionFunnel();
}
