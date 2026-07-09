import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { getVacations } from '../backend/backend-client.js'
import { handleBackendTool } from './handle-backend-tool.js'

interface VacationRow {
    id: string
    destination: string
    description: string
    startDate: string
    endDate: string
    price: number
    likesCount: number
    likedByMe: boolean
}

function toMarkdown(rows: VacationRow[]): string {
    if (rows.length === 0) return 'no vacations matched'

    const header = '| Destination | Departs | Returns | Price | Likes | Liked by me |\n|---|---|---|---|---|---|'
    const lines = rows.map(v =>
        `| ${v.destination} | ${v.startDate} | ${v.endDate} | $${v.price} | ${v.likesCount} | ${v.likedByMe ? 'yes' : 'no'} |`
    )
    return [header, ...lines].join('\n')
}

export function registerListVacationsTool(server: McpServer) {
    server.registerTool(
        'otherworld_list_vacations',
        {
            description: 'Lists vacations from the Otherworld system: destination, dates, price, likes count and whether the authenticated user liked each one. Supports a singular filter (all / liked / active / upcoming), offset/limit pagination, and json or markdown output.',
            inputSchema: z.object({
                filter: z.enum(['all', 'liked', 'active', 'upcoming'])
                    .default('all')
                    .describe('all = every vacation; liked = only vacations the authenticated user liked; active = currently running; upcoming = not started yet'),
                offset: z.number().int().min(0).default(0)
                    .describe('number of vacations to skip (for pagination)'),
                limit: z.number().int().min(1).max(100).default(25)
                    .describe('maximum vacations to return (1-100)'),
                response_format: z.enum(['markdown', 'json'])
                    .default('markdown')
                    .describe('markdown for a readable table, json for full structured records'),
            }),
            annotations: {
                readOnlyHint: true,
                idempotentHint: true,
                openWorldHint: false,
            },
        },
        async ({ filter, offset, limit, response_format }) => handleBackendTool(async () => {
            // fetch one extra row to know whether more pages exist
            const rows: VacationRow[] = await getVacations({ filter, offset, limit: limit + 1 })

            const page = rows.slice(0, limit)
            const hasMore = rows.length > limit

            const pagination = {
                count: page.length,
                offset,
                has_more: hasMore,
                next_offset: hasMore ? offset + page.length : null,
            }

            if (response_format === 'json') {
                return { ...pagination, vacations: page }
            }

            const footer = hasMore
                ? `\n\nshowing ${page.length} from offset ${offset} - more available at offset ${pagination.next_offset}`
                : `\n\nshowing all ${page.length} matching vacation(s)`

            return toMarkdown(page) + footer
        })
    )
}