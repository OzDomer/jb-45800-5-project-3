import * as z from 'zod'

export const itineraryValidator = z.object({
    vacationId: z.uuid('please choose a vacation'),
})