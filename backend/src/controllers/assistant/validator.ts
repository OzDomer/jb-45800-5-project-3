import * as z from 'zod'

export const assistantValidator = z.object({
    prompt: z.string('please type a question').trim().min(1, 'please type a question').max(2000, 'question is too long'),
})