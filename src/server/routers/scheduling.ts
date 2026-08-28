/**
 * Scheduling Router
 *
 * Handles therapist availability management and patient booking.
 * Includes timezone-aware scheduling, recurring availability, and double-booking prevention.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, therapistProcedure, patientProcedure } from '../trpc';

// Types
export interface TimeSlot {
  id: string;
  therapistId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isBooked: boolean;
  isBlocked: boolean;
  sessionId?: string;
  patientId?: string;
  patientName?: string;
}

export interface RecurringAvailability {
  id: string;
  therapistId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// Mock data store
const mockTimeSlots: TimeSlot[] = [];
const mockRecurringAvailability: RecurringAvailability[] = [
  // Default availability for demo therapist
  { id: 'rec-1', therapistId: 'therapist-1', dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isActive: true },
  { id: 'rec-2', therapistId: 'therapist-1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
  { id: 'rec-3', therapistId: 'therapist-1', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
  { id: 'rec-4', therapistId: 'therapist-1', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
  { id: 'rec-5', therapistId: 'therapist-1', dayOfWeek: 4, startTime: '09:00', endTime: '14:00', isActive: true },
];

// Helper to generate time slots from recurring availability
function generateSlotsForDate(
  therapistId: string,
  date: string,
  sessionDuration: number = 50
): TimeSlot[] {
  const dayOfWeek = new Date(date).getDay();
  const recurring = mockRecurringAvailability.filter(
    (r) => r.therapistId === therapistId && r.dayOfWeek === dayOfWeek && r.isActive
  );

  const slots: TimeSlot[] = [];

  for (const rec of recurring) {
    const [startHour, startMin] = rec.startTime.split(':').map(Number);
    const [endHour, endMin] = rec.endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour * 60 + currentMin + sessionDuration <= endHour * 60 + endMin) {
      const startTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      const endMinTotal = currentHour * 60 + currentMin + sessionDuration;
      const endTimeStr = `${String(Math.floor(endMinTotal / 60)).padStart(2, '0')}:${String(endMinTotal % 60).padStart(2, '0')}`;

      // Check if slot exists
      const existingSlot = mockTimeSlots.find(
        (s) => s.therapistId === therapistId && s.date === date && s.startTime === startTimeStr
      );

      if (existingSlot) {
        slots.push(existingSlot);
      } else {
        slots.push({
          id: `slot-${date}-${startTimeStr}`,
          therapistId,
          date,
          startTime: startTimeStr,
          endTime: endTimeStr,
          isBooked: false,
          isBlocked: false,
        });
      }

      // Move to next slot
      currentMin += sessionDuration + 10; // 10 min break between sessions
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
  }

  return slots;
}

export const schedulingRouter = router({
  // ==================== THERAPIST PROCEDURES ====================

  /**
   * Get therapist's recurring availability
   */
  getRecurringAvailability: therapistProcedure.query(async () => {
    const therapistId = 'therapist-1'; // From session
    return mockRecurringAvailability.filter((r) => r.therapistId === therapistId);
  }),

  /**
   * Set recurring availability for a day
   */
  setRecurringAvailability: therapistProcedure
    .input(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const therapistId = 'therapist-1';
      const existing = mockRecurringAvailability.find(
        (r) => r.therapistId === therapistId && r.dayOfWeek === input.dayOfWeek
      );

      if (existing) {
        existing.startTime = input.startTime;
        existing.endTime = input.endTime;
        existing.isActive = input.isActive;
        return existing;
      }

      const newRec: RecurringAvailability = {
        id: `rec-${Date.now()}`,
        therapistId,
        ...input,
      };
      mockRecurringAvailability.push(newRec);
      return newRec;
    }),

  /**
   * Get availability for a date range
   */
  getAvailability: therapistProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const therapistId = 'therapist-1';
      const slots: TimeSlot[] = [];

      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const daySlots = generateSlotsForDate(therapistId, dateStr);
        slots.push(...daySlots);
      }

      return slots;
    }),

  /**
   * Block a specific time slot
   */
  blockTimeSlot: therapistProcedure
    .input(
      z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const therapistId = 'therapist-1';

      // Check if slot already exists
      let slot = mockTimeSlots.find(
        (s) =>
          s.therapistId === therapistId &&
          s.date === input.date &&
          s.startTime === input.startTime
      );

      if (slot) {
        if (slot.isBooked) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Cannot block a booked slot',
          });
        }
        slot.isBlocked = true;
      } else {
        slot = {
          id: `slot-${Date.now()}`,
          therapistId,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          isBooked: false,
          isBlocked: true,
        };
        mockTimeSlots.push(slot);
      }

      return slot;
    }),

  /**
   * Unblock a time slot
   */
  unblockTimeSlot: therapistProcedure
    .input(
      z.object({
        slotId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const slot = mockTimeSlots.find((s) => s.id === input.slotId);
      if (slot) {
        slot.isBlocked = false;
      }
      return { success: true };
    }),

  /**
   * Get booked sessions for calendar view
   */
  getBookedSessions: therapistProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const therapistId = 'therapist-1';
      return mockTimeSlots.filter(
        (s) =>
          s.therapistId === therapistId &&
          s.isBooked &&
          s.date >= input.startDate &&
          s.date <= input.endDate
      );
    }),

  // ==================== PATIENT PROCEDURES ====================

  /**
   * Get available slots for a therapist (patient view)
   */
  getTherapistAvailability: patientProcedure
    .input(
      z.object({
        therapistId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const slots: TimeSlot[] = [];

      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const daySlots = generateSlotsForDate(input.therapistId, dateStr);
        // Only return available (not booked, not blocked) slots
        const availableSlots = daySlots.filter((s) => !s.isBooked && !s.isBlocked);
        slots.push(...availableSlots);
      }

      // Don't show slots in the past
      const now = new Date();
      return slots.filter((s) => {
        const slotDateTime = new Date(`${s.date}T${s.startTime}`);
        return slotDateTime > now;
      });
    }),

  /**
   * Book a session slot
   */
  bookSession: patientProcedure
    .input(
      z.object({
        therapistId: z.string(),
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        isOnline: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const patientId = 'patient-1'; // From session

      // Check for double booking
      const existingSlot = mockTimeSlots.find(
        (s) =>
          s.therapistId === input.therapistId &&
          s.date === input.date &&
          s.startTime === input.startTime
      );

      if (existingSlot?.isBooked) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This time slot is already booked',
        });
      }

      if (existingSlot?.isBlocked) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This time slot is not available',
        });
      }

      // Create or update slot
      const sessionId = `session-${Date.now()}`;
      const slot: TimeSlot = {
        id: existingSlot?.id || `slot-${Date.now()}`,
        therapistId: input.therapistId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        isBooked: true,
        isBlocked: false,
        sessionId,
        patientId,
        patientName: 'ישראל ישראלי', // From session
      };

      if (existingSlot) {
        Object.assign(existingSlot, slot);
      } else {
        mockTimeSlots.push(slot);
      }

      return {
        success: true,
        sessionId,
        slot,
      };
    }),

  /**
   * Cancel a booked session
   */
  cancelSession: patientProcedure
    .input(
      z.object({
        sessionId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const slot = mockTimeSlots.find((s) => s.sessionId === input.sessionId);
      if (slot) {
        slot.isBooked = false;
        slot.sessionId = undefined;
        slot.patientId = undefined;
        slot.patientName = undefined;
      }
      return { success: true };
    }),
});
