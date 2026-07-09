import axios from 'axios'
import type { CallToolResult } from '@modelcontextprotocol/server'

function getBackendErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
        return 'something bad happened'
    }

    const status = error.response?.status
    const data = error.response?.data

    if (status === 401) {
        return 'authentication failed'
    }

    if (typeof data === 'string' && data) {
        return data
    }

    if (status && status >= 500) {
        return 'something bad happened'
    }

    return error.message || 'something bad happened'
}

export async function handleBackendTool(handler: () => Promise<unknown>): Promise<CallToolResult> {
    try {
        const data = await handler()

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(data, null, 2),
                },
            ],
        }
    } catch (e) {
        console.error('backend tool error', e)

        return {
            content: [
                {
                    type: 'text',
                    text: getBackendErrorMessage(e),
                },
            ],
            isError: true,
        }
    }
}