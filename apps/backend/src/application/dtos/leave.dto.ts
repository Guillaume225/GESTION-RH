import { z } from 'zod';

export const createLeaveSchema = z.object({
  type: z.enum(['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'RTT', 'FAMILY_EVENT', 'OTHER']),
  startDate: z.string().datetime({ message: 'Date de début requise' }),
  endDate: z.string().datetime({ message: 'Date de fin requise' }),
  reason: z.string().max(500).optional(),
});

export const reviewLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNote: z.string().max(500).optional(),
});

export type CreateLeaveDto = z.infer<typeof createLeaveSchema>;
export type ReviewLeaveDto = z.infer<typeof reviewLeaveSchema>;
