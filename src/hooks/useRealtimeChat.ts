'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatMessage, TypingEvent } from '@/lib/realtime';

interface UseRealtimeChatOptions {
  userId: string;
  threadIds: string[];
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (event: TypingEvent) => void;
  onMessagesRead?: (data: { threadId: string; messageIds: string[]; readBy: string }) => void;
}

export function useRealtimeChat({
  userId,
  threadIds,
  onMessage,
  onTyping,
  onMessagesRead,
}: UseRealtimeChatOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!userId) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Build URL with thread IDs
    const params = new URLSearchParams({
      userId,
      threadIds: threadIds.join(','),
    });

    const url = `/api/chat/stream?${params.toString()}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setConnectionError('Connection lost. Reconnecting...');

      // Attempt reconnection after 3 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    // Handle specific event types
    eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      console.log('[Chat] Connected:', data);
      setIsConnected(true);
    });

    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data) as ChatMessage;
      onMessage?.(data);
    });

    eventSource.addEventListener('typing', (event) => {
      const data = JSON.parse(event.data) as TypingEvent;
      onTyping?.(data);
    });

    eventSource.addEventListener('user-event', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'messages-read') {
        onMessagesRead?.(data);
      }
    });

    eventSource.addEventListener('heartbeat', () => {
      // Keep-alive received
    });
  }, [userId, threadIds, onMessage, onTyping, onMessagesRead]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Reconnect when thread IDs change
  useEffect(() => {
    if (isConnected && threadIds.length > 0) {
      connect();
    }
  }, [threadIds.join(','), connect, isConnected]);

  return {
    isConnected,
    connectionError,
    reconnect: connect,
  };
}
