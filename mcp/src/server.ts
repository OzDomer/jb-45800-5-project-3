import { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { registerListVacationsTool } from './tools/list-vacations.js'
import { registerGetVacationsSummaryTool } from './tools/get-vacations-summary.js'

export function createMcpServer() {
    const server = new McpServer(
        {
            name: 'otherworld-mcp-server',
            version: '1.0.0',
        },
        {
            instructions: 'Tools for querying the Otherworld vacations data. Requires a valid JWT in the Authorization header. Use otherworld_get_vacations_summary for counts, averages and statistics; use otherworld_list_vacations for the vacations themselves.',
        }
    )

    server.registerTool(
        'otherworld_ping',
        {
            description: 'Health check tool that returns pong',
            inputSchema: z.object({}),
            annotations: {
                readOnlyHint: true,
                idempotentHint: true,
                openWorldHint: false,
            },
        },
        async () => {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'pong',
                    },
                ],
            }
        }
    )

    registerListVacationsTool(server)
    registerGetVacationsSummaryTool(server)

    return server
}