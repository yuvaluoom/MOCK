/**
 * Real-time Module Exports
 */

export {
  chatEmitter,
  getThreadChannel,
  getUserChannel,
  getTypingChannel,
  type ChatMessage,
  type TypingEvent,
  type MessageReadEvent,
  type OnlineStatusEvent,
} from './event-emitter';

export {
  adminSyncBus,
  type AdminRealtimeEvent,
} from './admin-sync';
