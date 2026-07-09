import * as z from 'zod'

const baseVacationValidator = z.object({
    destination: z.string('destination is required').trim().min(1, 'destination is required'),
    description: z.string('description is required').trim().min(1, 'description is required'),
    startDate: z.coerce.date('please choose a valid start date'),
    endDate: z.coerce.date('please choose a valid end date'),
    // multipart form fields arrive as strings - coerce into a number
    price: z.coerce.number('price must be a number')
        .min(0, 'price cannot be negative')
        .max(10000, 'price must be at most 10,000'),
})

const endAfterStart = {
    check: (vacation: { startDate: Date, endDate: Date }) => vacation.endDate >= vacation.startDate,
    message: 'end date cannot be before start date',
}

function startOfToday(): Date {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
}

export const newVacationValidator = baseVacationValidator
    .refine(endAfterStart.check, endAfterStart.message)
    .refine((vacation) => vacation.startDate >= startOfToday(), 'start date cannot be in the past')

// editing past vacations is allowed, so no past-date rule here
export const updateVacationValidator = baseVacationValidator
    .refine(endAfterStart.check, endAfterStart.message)

export const vacationIdValidator = z.object({
    vacationId: z.uuid('vacation id must be a valid uuid'),
})

// exactly one filter applies per request (singular filters)
export const listVacationsValidator = z.object({
    filter: z.enum(['all', 'liked', 'active', 'upcoming'], 'unknown vacations filter').default('all'),
    offset: z.coerce.number('offset must be a number').int().min(0, 'offset cannot be negative').default(0),
    limit: z.coerce.number('limit must be a number').int().min(1, 'limit must be at least 1').max(1000, 'limit must be at most 1000').default(9),
})

export type ListVacationsQuery = z.infer<typeof listVacationsValidator>

const imageFileValidator = z.looseObject({
    mimetype: z.enum(['image/jpeg', 'image/png'], 'image must be a jpeg or png file'),
}, 'please attach a vacation image')

export const newVacationFilesValidator = z.object({
    image: imageFileValidator,
})

export const updateVacationFilesValidator = z.object({
    image: imageFileValidator.optional(),
})