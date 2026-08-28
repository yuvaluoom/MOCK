/**
 * Admin Real-Time Sync Bus
 *
 * Bridges mock-db events → SSE client connections.
 *
 * Architecture:
 *   mock-db.emit('THERAPIST_STATUS_CHANGED')
 *     → AdminSyncBus listener
 *       → pushes to all connected SSE clients
 *         → client receives event, invalidates React Query cache
 *
 * In production, replace with Redis Pub/Sub or WebSocket server.
 */

import { mockDb, type DbEvent, type DbEventType } from '@/lib/database/mock-db';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AdminRealtimeEvent {
  /** Unique event ID */
  id: string;
  /** Event type from mock-db */
  type: DbEventType;
  /** Entity type (THERAPIST, SESSION, etc.) */
  entityType: string;
  /** Affected entity ID */
  entityId: string;
  /** ISO timestamp */
  timestamp: string;
  /** Event payload (safe for JSON serialization) */
  data: Record<string, unknown>;
  /** Which React Query keys to invalidate */
  invalidates: string[];
}

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
  connectedAt: Date;
};

// ─── Invalidation Mapping ───────────────────────────────────────────────────
// Maps each mock-db event type to the tRPC query keys that should be refetched

const INVALIDATION_MAP: Record<DbEventType, string[]> = {
  USER_CREATED:              ['admin.getDashboardStats', 'admin.getUsers', 'adminEmail.getUsers'],
  USER_UPDATED:              ['admin.getDashboardStats', 'admin.getUsers'],
  THERAPIST_STATUS_CHANGED:  ['admin.getDashboardStats', 'admin.getTherapistApplications', 'admin.getTherapistApplication'],
  THERAPIST_PROFILE_UPDATED: ['admin.getTherapistApplications', 'admin.getTherapistApplication'],
  SESSION_STATUS_CHANGED:    ['admin.getDashboardStats', 'admin.getTherapistApplications'],
  NOTIFICATION_CREATED:      ['admin.getNotifications', 'admin.getDashboardStats'],
  MATCH_UPDATED:             ['admin.getDashboardStats'],
  EMAIL_SENT:                ['admin.getEmailLogs', 'adminEmail.getStatistics', 'adminEmail.getEmailHistory'],
  AUDIT_LOG_CREATED:         ['admin.getAuditLogs', 'admin.getDashboardStats'],
};

// ─── Admin Sync Bus (Singleton) ─────────────────────────────────────────────

class AdminSyncBus {
  private clients: Map<string, SSEClient> = new Map();
  private eventCounter = 0;
  private initialized = false;
  private recentEvents: AdminRealtimeEvent[] = [];
  private readonly MAX_RECENT = 50;

  /**
   * Initialize by subscribing to ALL mock-db event types.
   * Call once at server startup.
   */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    const allEventTypes: DbEventType[] = [
      'USER_CREATED',
      'USER_UPDATED',
      'THERAPIST_STATUS_CHANGED',
      'THERAPIST_PROFILE_UPDATED',
      'SESSION_STATUS_CHANGED',
      'NOTIFICATION_CREATED',
      'MATCH_UPDATED',
      'EMAIL_SENT',
      'AUDIT_LOG_CREATED',
    ];

    for (const eventType of allEventTypes) {
      mockDb.on(eventType, (dbEvent: DbEvent) => {
        this.broadcast(dbEvent);
      });
    }

    console.log('[AdminSyncBus] Initialized — listening to all mock-db events');
  }

  /**
   * Register a new SSE client connection.
   * Returns a cleanup function.
   */
  addClient(id: string, controller: ReadableStreamDefaultController): () => void {
    const client: SSEClient = { id, controller, connectedAt: new Date() };
    this.clients.set(id, client);
    console.log(`[AdminSyncBus] Client connected: ${id} (total: ${this.clients.size})`);

    // Send initial connection event
    this.sendToClient(client, {
      id: `init-${id}`,
      type: 'USER_CREATED' as DbEventType, // placeholder type
      entityType: 'SYSTEM',
      entityId: 'connection',
      timestamp: new Date().toISOString(),
      data: { connected: true, clientId: id, clientCount: this.clients.size },
      invalidates: [],
    });

    return () => {
      this.clients.delete(id);
      console.log(`[AdminSyncBus] Client disconnected: ${id} (total: ${this.clients.size})`);
    };
  }

  /**
   * Broadcast a mock-db event to all connected SSE clients.
   */
  private broadcast(dbEvent: DbEvent): void {
    const eventId = `evt-${++this.eventCounter}-${Date.now()}`;
    const invalidates = INVALIDATION_MAP[dbEvent.type] || [];

    const realtimeEvent: AdminRealtimeEvent = {
      id: eventId,
      type: dbEvent.type,
      entityType: dbEvent.entityType,
      entityId: dbEvent.entityId,
      timestamp: new Date().toISOString(),
      data: this.serializeEventData(dbEvent),
      invalidates,
    };

    // Store in recent events buffer
    this.recentEvents.push(realtimeEvent);
    if (this.recentEvents.length > this.MAX_RECENT) {
      this.recentEvents = this.recentEvents.slice(-this.MAX_RECENT);
    }

    // Push to all connected clients
    const deadClients: string[] = [];
    const clientEntries = Array.from(this.clients.entries());

    for (let i = 0; i < clientEntries.length; i++) {
      const [cId, cl] = clientEntries[i];
      try {
        this.sendToClient(cl, realtimeEvent);
      } catch {
        deadClients.push(cId);
      }
    }

    // Clean up dead connections
    for (let i = 0; i < deadClients.length; i++) {
      this.clients.delete(deadClients[i]);
    }

    if (this.clients.size > 0) {
      console.log(
        `[AdminSyncBus] Broadcast ${dbEvent.type} → ${this.clients.size} clients | invalidates: [${invalidates.join(', ')}]`
      );
    }
  }

  /**
   * Send an event to a single SSE client using the SSE wire protocol.
   */
  private sendToClient(client: SSEClient, event: AdminRealtimeEvent): void {
    const sseData = `id: ${event.id}\nevent: platform-event\ndata: ${JSON.stringify(event)}\n\n`;
    client.controller.enqueue(new TextEncoder().encode(sseData));
  }

  /**
   * Safely serialize DbEvent data for JSON transport.
   */
  private serializeEventData(dbEvent: DbEvent): Record<string, unknown> {
    const data: Record<string, unknown> = {
      entityType: dbEvent.entityType,
      entityId: dbEvent.entityId,
    };

    if (dbEvent.data) {
      for (const [key, value] of Object.entries(dbEvent.data)) {
        if (value instanceof Date) {
          data[key] = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          try {
            JSON.stringify(value);
            data[key] = value;
          } catch {
            data[key] = String(value);
          }
        } else {
          data[key] = value;
        }
      }
    }

    return data;
  }

  /**
   * Get current connection stats.
   */
  getStats(): { clientCount: number; totalEvents: number; recentEvents: number } {
    return {
      clientCount: this.clients.size,
      totalEvents: this.eventCounter,
      recentEvents: this.recentEvents.length,
    };
  }

  /**
   * Get recent events (for initial load / catch-up).
   */
  getRecentEvents(limit = 20): AdminRealtimeEvent[] {
    return this.recentEvents.slice(-limit);
  }
}

// ─── Singleton Export ───────────────────────────────────────────────────────

export const adminSyncBus = new AdminSyncBus();

// Auto-initialize when this module is first imported
adminSyncBus.init();
