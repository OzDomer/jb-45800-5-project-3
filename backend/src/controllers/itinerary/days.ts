const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

// inclusive day count: a vacation from the 1st to the 3rd is 3 days
export function displayVacationDays(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.round((end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY) + 1
}