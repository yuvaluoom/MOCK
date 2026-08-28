import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import {
  mockMessageThreads,
  mockMessages,
  mockPatient,
  mockTherapists,
  type UserRole,
} from '../mock-data';
import { sendNewMessageNotification } from '@/lib/email';
import {
  chatEmitter,
  getThreadChannel,
  getTypingChannel,
  getUserChannel,
  type ChatMessage,
} from '@/lib/realtime';

export const messagesRouter = router({
  /**
   * Get all threads for the current user
   */
  getThreads: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const role = ctx.user.role;

    let threads = mockMessageThreads;

    // Filter threads by role
    if (role === 'PATIENT') {
      threads = threads.filter((t) => t.patientId === mockPatient.id);
    } else if (role === 'THERAPIST') {
      const therapist = mockTherapists.find((t) => t.userId === userId);
      if (therapist) {
        threads = threads.filter((t) => t.therapistId === therapist.id);
      }
    }

    // Enrich with participant info and unread count
    return threads.map((thread) => {
      const therapist = mockTherapists.find((t) => t.id === thread.therapistId);
      const threadMessages = mockMessages.filter((m) => m.threadId === thread.id);
      const unreadCount = threadMessages.filter(
        (m) => m.senderId !== userId && !m.readAt
      ).length;

      // Check online status of the other party
      const otherUserId = role === 'PATIENT'
        ? therapist?.userId
        : mockPatient.userId;
      const isOtherOnline = otherUserId ? chatEmitter.isUserOnline(otherUserId) : false;

      return {
        ...thread,
        patient: {
          id: mockPatient.id,
          firstName: mockPatient.firstName,
          lastName: mockPatient.lastName,
        },
        therapist: therapist
          ? {
              id: therapist.id,
              firstName: therapist.firstName,
              lastName: therapist.lastName,
              photoThumbnailUrl: therapist.photoThumbnailUrl,
            }
          : null,
        unreadCount,
        isOtherOnline,
        lastMessage: threadMessages.length > 0
          ? threadMessages[threadMessages.length - 1]
          : null,
      };
    });
  }),

  /**
   * Get messages in a thread
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const thread = mockMessageThreads.find((t) => t.id === input.threadId);

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        });
      }

      let messages = mockMessages
        .filter((m) => m.threadId === input.threadId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const total = messages.length;
      const skip = (input.page - 1) * input.limit;
      const paged = messages.slice(skip, skip + input.limit);

      return {
        messages: paged.reverse(), // Return in chronological order
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Send a message with real-time broadcast
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        threadId: z.string().optional(),
        recipientId: z.string(), // therapistId or patientId
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let threadId = input.threadId;
      let recipientUserId: string | undefined;

      // Create thread if it doesn't exist
      if (!threadId) {
        const existingThread = mockMessageThreads.find(
          (t) =>
            (t.patientId === mockPatient.id && t.therapistId === input.recipientId) ||
            (t.therapistId === input.recipientId)
        );

        if (existingThread) {
          threadId = existingThread.id;
        } else {
          const newThread = {
            id: `thread-${Date.now()}`,
            patientId: ctx.user.role === 'PATIENT' ? mockPatient.id : input.recipientId,
            therapistId: ctx.user.role === 'THERAPIST' ? mockTherapists[0].id : input.recipientId,
            subject: null,
            lastMessageAt: new Date(),
            createdAt: new Date(),
          };
          mockMessageThreads.push(newThread);
          threadId = newThread.id;
        }
      }

      // Get sender name
      let senderName = 'Unknown';
      if (ctx.user.role === 'PATIENT') {
        senderName = `${mockPatient.firstName} ${mockPatient.lastName}`;
        const therapist = mockTherapists.find((t) => t.id === input.recipientId);
        recipientUserId = therapist?.userId;
      } else {
        const therapist = mockTherapists.find((t) => t.userId === ctx.user.id);
        if (therapist) {
          senderName = `${therapist.firstName} ${therapist.lastName}`;
        }
        recipientUserId = mockPatient.userId;
      }

      const newMessage = {
        id: `msg-${Date.now()}`,
        threadId,
        senderId: ctx.user.id,
        senderRole: ctx.user.role as UserRole,
        content: input.content,
        readAt: null,
        createdAt: new Date(),
      };

      mockMessages.push(newMessage);

      // Update thread's lastMessageAt
      const thread = mockMessageThreads.find((t) => t.id === threadId);
      if (thread) {
        thread.lastMessageAt = new Date();
      }

      // Emit real-time event to thread subscribers
      const chatMessage: ChatMessage = {
        id: newMessage.id,
        threadId: newMessage.threadId,
        senderId: newMessage.senderId,
        senderRole: newMessage.senderRole as 'PATIENT' | 'THERAPIST' | 'ADMIN',
        senderName,
        content: newMessage.content,
        createdAt: newMessage.createdAt,
      };
      chatEmitter.emit(getThreadChannel(threadId), chatMessage);

      // Notify recipient via their user channel
      if (recipientUserId) {
        chatEmitter.emit(getUserChannel(recipientUserId), {
          type: 'new-message',
          threadId,
          message: chatMessage,
        });
      }

      // Send email notification if recipient is offline
      const isRecipientOnline = recipientUserId
        ? chatEmitter.isUserOnline(recipientUserId)
        : false;

      if (!isRecipientOnline) {
        if (ctx.user.role === 'PATIENT') {
          const therapist = mockTherapists.find((t) => t.id === input.recipientId);
          if (therapist) {
            await sendNewMessageNotification(
              therapist.email,
              therapist.firstName,
              `${mockPatient.firstName} ${mockPatient.lastName}`,
              input.content.substring(0, 100)
            );
          }
        } else {
          await sendNewMessageNotification(
            mockPatient.email,
            mockPatient.firstName,
            senderName,
            input.content.substring(0, 100)
          );
        }
      }

      return newMessage;
    }),

  /**
   * Send typing indicator
   */
  sendTypingIndicator: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        isTyping: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let userName = 'Unknown';
      if (ctx.user.role === 'PATIENT') {
        userName = `${mockPatient.firstName} ${mockPatient.lastName}`;
      } else {
        const therapist = mockTherapists.find((t) => t.userId === ctx.user.id);
        if (therapist) {
          userName = `${therapist.firstName} ${therapist.lastName}`;
        }
      }

      // Emit typing indicator
      chatEmitter.emit(getTypingChannel(input.threadId), {
        threadId: input.threadId,
        userId: ctx.user.id,
        userName,
        isTyping: input.isTyping,
      });

      return { success: true };
    }),

  /**
   * Mark messages as read with real-time notification
   */
  markAsRead: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const readMessageIds: string[] = [];

      for (const msg of mockMessages) {
        if (msg.threadId === input.threadId && msg.senderId !== ctx.user.id && !msg.readAt) {
          msg.readAt = now;
          readMessageIds.push(msg.id);
        }
      }

      // Emit read receipt
      if (readMessageIds.length > 0) {
        chatEmitter.emit(getThreadChannel(input.threadId), {
          type: 'messages-read',
          threadId: input.threadId,
          messageIds: readMessageIds,
          readBy: ctx.user.id,
          readAt: now,
        });
      }

      return { markedCount: readMessageIds.length };
    }),

  /**
   * Get unread message count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const unread = mockMessages.filter(
      (m) => m.senderId !== userId && !m.readAt
    ).length;

    return { count: unread };
  }),

  /**
   * Check if user is online
   */
  checkOnlineStatus: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return {
        userId: input.userId,
        isOnline: chatEmitter.isUserOnline(input.userId),
      };
    }),
});
