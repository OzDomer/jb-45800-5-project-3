export function displayDate(date: string): string {
    return (new Date(date)).toLocaleDateString()
}

// fares keep their cents when they have them: 1899.5 -> 1,899.50, 450 -> 450
export function displayPrice(price: number): string {
    return price.toLocaleString('en-US', {
        minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
        maximumFractionDigits: 2
    })
}