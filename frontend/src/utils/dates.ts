export function displayDate(date: string): string {
    return (new Date(date)).toLocaleDateString()
}