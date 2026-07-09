import { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { registerGetVacationsTool } from './tools/get-vacations.js'
import { registerGetVacationsSummaryTool } from './tools/get-vacations-summary.js'

export function createMcpServer() {
    const server = new McpServer(
        {
            name: 'vacations-mcp',
            version: '1.0.0',
        },
        {
            instructions: 'Tools for querying the vacations system data. Requires a valid JWT in the Authorization header.',
        }
    )

    server.registerTool(
        'ping',
        {
            description: 'Health check tool that returns pong',
            inputSchema: z.object({}),
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

    registerGetVacationsTool(server)
    registerGetVacationsSummaryTool(server)

    return server
}