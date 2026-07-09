import config from 'config'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

// connects to our MCP service over streamable http,
// forwarding the caller's jwt so the whole auth chain stays intact:
// frontend -> backend -> mcp server -> backend rest api
export async function connectMcpClient(jwt: string): Promise<Client> {
    const client = new Client({
        name: 'otherworld-backend',
        version: '1.0.0',
    })

    const transport = new StreamableHTTPClientTransport(
        new URL(config.get<string>('mcp.server')),
        {
            requestInit: {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            },
        }
    )

    await client.connect(transport)

    return client
}