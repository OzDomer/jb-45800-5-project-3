import { newVacationValidator, updateVacationValidator, listVacationsValidator } from "./validator"

// multipart form fields arrive as strings - the validators must coerce them
const validDraft = {
    destination: 'Krypton',
    description: 'A super getaway under a red sun with cape-flying lessons included.',
    startDate: '2099-05-01',
    endDate: '2099-05-10',
    price: '1234.50',
}

describe('vacations validator tests', () => {
    describe('newVacationValidator', () => {
        it('accepts a valid draft and coerces the multipart strings', () => {
            const result = newVacationValidator.safeParse(validDraft)

            expect(result.success).toBe(true)
            if (!result.success) return
            expect(result.data.price).toBe(1234.5)
            expect(result.data.startDate).toBeInstanceOf(Date)
            expect(result.data.endDate).toBeInstanceOf(Date)
        })

        it('rejects a start date in the past with a friendly message', () => {
            const result = newVacationValidator.safeParse({ ...validDraft, startDate: '2020-01-01' })

            expect(result.success).toBe(false)
            if (result.success) return
            expect(result.error.issues[0].message).toBe('start date cannot be in the past')
        })

        it('rejects an end date before the start date', () => {
            const result = newVacationValidator.safeParse({ ...validDraft, endDate: '2099-04-01' })

            expect(result.success).toBe(false)
            if (result.success) return
            expect(result.error.issues[0].message).toBe('end date cannot be before start date')
        })

        it('rejects a price above 10,000', () => {
            const result = newVacationValidator.safeParse({ ...validDraft, price: '20000' })

            expect(result.success).toBe(false)
            if (result.success) return
            expect(result.error.issues[0].message).toBe('price must be at most 10,000')
        })

        it('rejects a negative price', () => {
            const result = newVacationValidator.safeParse({ ...validDraft, price: '-5' })

            expect(result.success).toBe(false)
            if (result.success) return
            expect(result.error.issues[0].message).toBe('price cannot be negative')
        })
    })

    describe('updateVacationValidator', () => {
        it('allows past dates - vacations that already ended can be edited', () => {
            const result = updateVacationValidator.safeParse({
                ...validDraft,
                startDate: '2020-01-01',
                endDate: '2020-01-10',
            })

            expect(result.success).toBe(true)
        })

        it('still enforces the date order', () => {
            const result = updateVacationValidator.safeParse({
                ...validDraft,
                startDate: '2020-01-10',
                endDate: '2020-01-01',
            })

            expect(result.success).toBe(false)
        })
    })

    describe('listVacationsValidator', () => {
        it('applies defaults: all, offset 0, limit 9', () => {
            const result = listVacationsValidator.safeParse({})

            expect(result.success).toBe(true)
            if (!result.success) return
            expect(result.data).toEqual({ filter: 'all', offset: 0, limit: 9 })
        })

        it('rejects an unknown filter (filters are singular and named)', () => {
            const result = listVacationsValidator.safeParse({ filter: 'cheap-and-active' })

            expect(result.success).toBe(false)
            if (result.success) return
            expect(result.error.issues[0].message).toBe('unknown vacations filter')
        })
    })
})