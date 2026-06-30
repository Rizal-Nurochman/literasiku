import { z } from 'zod'

export const createLoanSchema = z.object({
  book_id: z.number().min(1, 'Book ID is required'),
  due_days: z.number().min(1).max(60).optional()
})

export type CreateLoanInput = z.infer<typeof createLoanSchema>

export const createDigitalLoanSchema = z.object({
  book_id: z.number().min(1, 'Book ID is required'),
  due_days: z.number().min(1).max(30).optional()
})

export type CreateDigitalLoanInput = z.infer<typeof createDigitalLoanSchema>
