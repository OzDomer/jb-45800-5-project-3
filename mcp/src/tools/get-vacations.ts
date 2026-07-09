import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { getVacations } from '../backend/backend-client.js'
import { handleBackendTool } from './handle-backend-tool.js'

export function registerGetVacationsTool(server: McpServer) {
    server.registerTool(
        'getVacations',
        {
            description: 'Returns every vacation in the system: destination, description, start and end dates, price, image url, likes count and whether the authenticated user liked it. Use it to answer any question about the vacations data.',
            inputSchema: z.object({}),
        },
        async () => handleBackendTool(() => getVacations())
    )
}