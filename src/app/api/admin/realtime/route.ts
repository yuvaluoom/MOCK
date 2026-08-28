/**
 * Admin Real-Time SSE Endpoint
 *
 * GET /api/admin/realtime
 *
 * Streams platform events to the admin dashboard in real-time via Server-Sent Events.
 * Every mock-db mutation (therapist registration, session change, email send, etc.)
 * is instantly pushed to connected admin clients.
 *
 * Wire protocol: SSE (text/event-stream)
 * Event name: "platform-event"
 * Data: JSON { id, type, entityType, entityId, timestamp, data, invalidates }
 */

import { adminSyncBus } from '@/lib/realtime/admin-sync';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const clientId = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const stream = new ReadableStream({
    start(controller) {
      // Register this client with the sync bus
      const cleanup = adminSyncBus.addClient(clientId, controller);

      // Send heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const ping = `event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now(), clients: adminSyncBus.getStats().clientCount })}\n\n`;
          controller.enqueue(new TextEncoder().encode(ping));
        } catch {
          clearInterval(heartbeat);
          cleanup();
        }
      }, 30_000);

      // Handle stream close
      const originalClose = controller.close.bind(controller);
      controller.close = () => {
        clearInterval(heartbeat);
        cleanup();
        try {
          originalClose();
        } catch {
          // already closed
        }
      };
    },

    cancel() {
      // Client disconnected — cleanup handled by close override
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
