import { displayVacationDays } from "./days"

describe('vacation days tests', () => {
    it('counts days inclusively - 1st to 3rd is 3 days', () => {
        expect(displayVacationDays('2026-07-01', '2026-07-03')).toBe(3)
    })

    it('a same-day trip is 1 day', () => {
        expect(displayVacationDays('2026-07-09', '2026-07-09')).toBe(1)
    })

    it('crosses month and year boundaries', () => {
        expect(displayVacationDays('2026-12-20', '2027-01-03')).toBe(15)
    })
})