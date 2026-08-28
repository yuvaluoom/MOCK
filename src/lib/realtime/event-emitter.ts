/**
 * Simple Event Emitter for Real-time Chat
 *
 * In production, this would use Redis Pub/Sub or a dedicated WebSocket server.
 * For development, this in-memory implementation provides the same API.
 */

type EventCallback = (data: unknown) => void;

class ChatEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> Set of connectionIds

  /**
   * Subscribe to events for a specific channel
   */
  subscribe(channel: string, callback: EventCallback): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    // Return unsubscribe function
    return () => {
      const channelListeners = this.listeners.get(channel);
      if (channelListeners) {
        channelListeners.delete(callback);
        if (channelListeners.size === 0) {
          this.listeners.delete(channel);
        }
      }
    };
  }

  /**
   * Emit an event to a specific channel
   */
  emit(channel: string, data: unknown): void {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('[ChatEventEmitter] Error in listener:', error);
        }
      });
    }
  }

  /**
   * Track user connection for online status
   */
  userConnected(userId: string, connectionId: string): void {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);

    // Emit online status
    this.emit(`user:${userId}:status`, { online: true });
  }

  /**
   * Remove user connection
   */
  userDisconnected(userId: string, connectionId: string): void {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(connectionId);
      if (connections.size === 0) {
        this.userConnections.delete(userId);
        // Emit offline status
        this.emit(`user:${userId}:status`, { online: false });
      }
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    const connections = this.userConnections.get(userId);
    return connections ? connections.size > 0 : false;
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userConnections.keys());
  }
}

// Singleton instance
export const chatEmitter = new ChatEventEmitter();

// Event types for type safety
export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: 'PATIENT' | 'THERAPIST' | 'ADMIN';
  senderName: string;
  content: string;
  createdAt: Date;
}

export interface TypingEvent {
  threadId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface MessageReadEvent {
  threadId: string;
  messageIds: string[];
  readBy: string;
  readAt: Date;
}

export interface OnlineStatusEvent {
  userId: string;
  online: boolean;
  lastSeen?: Date;
}

// Channel helpers
export const getThreadChannel = (threadId: string) => `thread:${threadId}`;
export const getUserChannel = (userId: string) => `user:${userId}`;
export const getTypingChannel = (threadId: string) => `typing:${threadId}`;
