import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { getVacations } from '../backend/backend-client.js'
import { handleBackendTool } from './handle-backend-tool.js'

interface VacationRow {
    destination: string
    startDate: string
    endDate: string
    price: number
    likesCount: number
}

// llms are unreliable at arithmetic - statistics are precomputed here
// so the model reports numbers instead of calculating them
async function buildSummary() {
    const vacations = await getVacations() as VacationRow[]

    const today = new Date().toISOString().slice(0, 10)

    const active = vacations.filter(v => v.startDate <= today && v.endDate >= today)
    const upcoming = vacations.filter(v => v.startDate > today)
    const ended = vacations.filter(v => v.endDate < today)

    const totalPrice = vacations.reduce((sum, v) => sum + v.price, 0)
    const averagePrice = vacations.length ? Math.round((totalPrice / vacations.length) * 100) / 100 : 0

    const byPrice = [...vacations].sort((a, b) => a.price - b.price)
    const byLikes = [...vacations].sort((a, b) => b.likesCount - a.likesCount)

    return {
        today,
        totalVacations: vacations.length,
        activeNow: { count: active.length, destinations: active.map(v => v.destination) },
        upcoming: { count: upcoming.length, destinations: upcoming.map(v => v.destination) },
        ended: { count: ended.length, destinations: ended.map(v => v.destination) },
        averagePrice,
        cheapest: byPrice[0] ? { destination: byPrice[0].destination, price: byPrice[0].price } : null,
        mostExpensive: byPrice.at(-1) ? { destination: byPrice.at(-1)!.destination, price: byPrice.at(-1)!.price } : null,
        totalLikes: vacations.reduce((sum, v) => sum + v.likesCount, 0),
        mostLiked: byLikes[0] ? { destination: byLikes[0].destination, likes: byLikes[0].likesCount } : null,
    }
}

export function registerGetVacationsSummaryTool(server: McpServer) {
    server.registerTool(
        'getVacationsSummary',
        {
            description: 'Returns precomputed, accurate statistics about the vacations: total count, active/upcoming/ended counts with destinations, average price, cheapest and most expensive, total likes and the most liked destination. ALWAYS prefer this tool over computing statistics yourself.',
            inputSchema: z.object({}),
        },
        async () => handleBackendTool(() => buildSummary())
    )
}