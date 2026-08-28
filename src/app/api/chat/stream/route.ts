/**
 * SSE Stream for Real-time Chat Updates
 *
 * This endpoint provides Server-Sent Events for:
 * - New messages
 * - Typing indicators
 * - Online status updates
 * - Message read receipts
 */

import { NextRequest } from 'next/server';
import {
  chatEmitter,
  getThreadChannel,
  getUserChannel,
  getTypingChannel,
} from '@/lib/realtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const threadIds = searchParams.get('threadIds')?.split(',') ?? [];

  if (!userId) {
    return new Response('Missing userId', { status: 400 });
  }

  // Generate unique connection ID
  const connectionId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Helper to send SSE event
      const sendEvent = (event: string, data: unknown) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection confirmation
      sendEvent('connected', {
        connectionId,
        userId,
        timestamp: new Date().toISOString(),
      });

      // Track user as online
      chatEmitter.userConnected(userId, connectionId);

      // Store unsubscribe functions
      const unsubscribes: (() => void)[] = [];

      // Subscribe to user-specific events
      unsubscribes.push(
        chatEmitter.subscribe(getUserChannel(userId), (data) => {
          sendEvent('user-event', data);
        })
      );

      // Subscribe to thread events
      threadIds.forEach((threadId) => {
        if (threadId) {
          // New messages in thread
          unsubscribes.push(
            chatEmitter.subscribe(getThreadChannel(threadId), (data) => {
              sendEvent('message', data);
            })
          );

          // Typing indicators
          unsubscribes.push(
            chatEmitter.subscribe(getTypingChannel(threadId), (data) => {
              sendEvent('typing', data);
            })
          );
        }
      });

      // Send periodic heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          sendEvent('heartbeat', { timestamp: new Date().toISOString() });
        } catch {
          // Connection closed
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unsubscribes.forEach((unsub) => unsub());
        chatEmitter.userDisconnected(userId, connectionId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
