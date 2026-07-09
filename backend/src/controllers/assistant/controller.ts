import type { NextFunction, Request, Response } from "express";
import type { ResponseInput, Tool } from "openai/resources/responses/responses";
import openai from "../../openai/openai";
import { connectMcpClient } from "./mcp-client";

/*
 * ARCHITECTURE NOTE - why the backend acts as the MCP CLIENT and runs the
 * tool loop itself, instead of handing OpenAI a hosted `type: 'mcp'` tool:
 *
 * 1. A hosted MCP tool is executed by OpenAI's servers, which must be able to
 *    reach the MCP server URL. Ours lives inside the docker compose network
 *    (http://mcp:3005) - unreachable from OpenAI's cloud. Making the hosted
 *    approach work would mean publicly exposing the MCP server (a reverse
 *    proxy / tunnel plus the security hardening that comes with a public
 *    endpoint) - infrastructure this system does not otherwise need.
 * 2. The model performs the same reasoning turns either way, so the cost is
 *    comparable - splitting them into separate API requests changes
 *    visibility and control, not economics:
 * 3. We cap the loop (MAX_TOOL_ROUNDS) so the LLM can never spin unchecked,
 *    and we log every tool call for observability.
 */

const MAX_TOOL_ROUNDS = 5

function extractJwt(request: { get(name: string): string | undefined }): string | null {
    const authHeader = request.get('Authorization')

    if (!authHeader?.startsWith('Bearer')) {
        return null
    }

    const [, jwt] = authHeader.split(' ')

    return jwt || null
}

export async function ask(request: Request<object, object, { prompt: string }>, response: Response, next: NextFunction) {
    const { prompt } = request.body
    const jwt = extractJwt(request)

    let mcpClient: Awaited<ReturnType<typeof connectMcpClient>> | null = null

    try {
        // connect to the mcp service with the caller's jwt and discover its tools
        mcpClient = await connectMcpClient(jwt!)
        const { tools: mcpTools } = await mcpClient.listTools()

        // expose the mcp tools to the model as plain function tools
        const tools: Tool[] = mcpTools.map((tool) => ({
            type: 'function',
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema as Record<string, unknown>,
            strict: false,
        }))

        const systemPrompt = `
You are the Otherworld vacations assistant.
Answer the user's question about the vacations data using the available tools.
Dates in the data are YYYY-MM-DD. Today is ${new Date().toISOString().slice(0, 10)}.
"Active" vacations already started and did not end yet; "upcoming" ones did not start.
For counts, averages or any statistic, use getVacationsSummary and report its
numbers as-is - never compute arithmetic yourself.
Answer concisely in plain text.
`.trim()

        const input: ResponseInput = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
        ]

        // the tool loop: let the model call tools, execute them against the
        // mcp server, feed the results back - capped so it can never run away
        let answer: string | undefined

        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
            const llmResponse = await openai.responses.create({
                model: 'gpt-4.1-mini',
                input,
                tools,
            })

            const functionCalls = llmResponse.output.filter(item => item.type === 'function_call')

            if (functionCalls.length === 0) {
                answer = llmResponse.output_text?.trim()
                break
            }

            input.push(...functionCalls)

            for (const functionCall of functionCalls) {
                console.log(`assistant tool call (round ${round + 1}): ${functionCall.name}`, functionCall.arguments)

                const result = await mcpClient.callTool({
                    name: functionCall.name,
                    arguments: JSON.parse(functionCall.arguments || '{}'),
                })

                const content = result.content as { type: string, text?: string }[]
                const text = content
                    .filter(part => part.type === 'text')
                    .map(part => part.text)
                    .join('\n')

                input.push({
                    type: 'function_call_output',
                    call_id: functionCall.call_id,
                    output: text || 'the tool returned no output',
                })
            }
        }

        if (!answer) {
            return next({
                status: 500,
                message: 'the assistant could not produce an answer, please try again'
            })
        }

        response.json({
            prompt,
            answer,
        })
    } catch (e) {
        console.error('assistant request error', e)
        next(e)
    } finally {
        await mcpClient?.close().catch(() => { })
    }
}