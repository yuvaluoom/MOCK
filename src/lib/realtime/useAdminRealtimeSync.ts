'use client';

/**
 * useAdminRealtimeSync — React hook for real-time admin dashboard sync
 *
 * Connects to the SSE endpoint at /api/admin/realtime and automatically
 * invalidates the relevant React Query (tRPC) caches whenever a platform
 * event fires. The admin dashboard re-renders with fresh data instantly.
 *
 * Usage:
 *   const { isConnected, lastEvent, eventLog } = useAdminRealtimeSync();
 *
 * The hook:
 * 1. Opens an EventSource to /api/admin/realtime
 * 2. Listens for "platform-event" SSE messages
 * 3. Parses each event's `invalidates` array
 * 4. Calls queryClient.invalidateQueries() for each affected tRPC key
 * 5. Maintains a rolling log of recent events for the activity feed
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface RealtimeEvent {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  data: Record<string, unknown>;
  invalidates: string[];
}

interface RealtimeSyncState {
  /** Whether the SSE connection is active */
  isConnected: boolean;
  /** Total events received this session */
  eventCount: number;
  /** Last received event */
  lastEvent: RealtimeEvent | null;
  /** Rolling log of recent events (most recent first) */
  eventLog: RealtimeEvent[];
  /** Connection status label */
  connectionStatus: 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
  /** Manually reconnect */
  reconnect: () => void;
}

const MAX_EVENT_LOG = 100;

/**
 * Map tRPC procedure key strings to React Query cache key arrays.
 * tRPC keys are structured as [['procedureName'], { type: 'query' }]
 */
function trpcKeyToQueryKey(trpcKey: string): unknown[][] {
  // tRPC React Query keys look like: [['admin','getDashboardStats'], { type: 'query' }]
  const parts = trpcKey.split('.');
  return [[parts]];
}

export function useAdminRealtimeSync(): RealtimeSyncState {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('connecting');
  const [eventCount, setEventCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [eventLog, setEventLog] = useState<RealtimeEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const invalidateQueries = useCallback(
    (invalidates: string[]) => {
      for (const key of invalidates) {
        const parts = key.split('.');
        // Invalidate all queries that match this tRPC procedure path
        queryClient.invalidateQueries({
          queryKey: [parts],
        });
      }
    },
    [queryClient]
  );

  const connect = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');

    const es = new EventSource('/api/admin/realtime');
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      console.log('[RealtimeSync] Connected to admin event stream');
    };

    // Listen for platform events
    es.addEventListener('platform-event', (e: MessageEvent) => {
      try {
        const event: RealtimeEvent = JSON.parse(e.data);

        setEventCount((c) => c + 1);
        setLastEvent(event);
        setEventLog((log) => {
          const updated = [event, ...log];
          return updated.slice(0, MAX_EVENT_LOG);
        });

        // Auto-invalidate relevant React Query caches
        if (event.invalidates && event.invalidates.length > 0) {
          invalidateQueries(event.invalidates);
        }
      } catch (err) {
        console.error('[RealtimeSync] Failed to parse event:', err);
      }
    });

    // Listen for heartbeats (keep-alive)
    es.addEventListener('heartbeat', () => {
      // Heartbeat received — connection is alive
    });

    es.onerror = () => {
      setIsConnected(false);
      setConnectionStatus('reconnecting');
      es.close();

      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('[RealtimeSync] Reconnecting...');
        connect();
      }, 3000);
    };
  }, [invalidateQueries]);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [connect]);

  return {
    isConnected,
    eventCount,
    lastEvent,
    eventLog,
    connectionStatus,
    reconnect,
  };
}
