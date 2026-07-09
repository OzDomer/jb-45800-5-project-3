import type { NextFunction, Request, Response } from 'express'
import { authContext } from './auth-context.js'

function extractJwt(request: Request): string | null {
    const authHeader = request.get('Authorization')

    if (!authHeader) {
        return null
    }

    if (!authHeader.startsWith('Bearer')) {
        return null
    }

    const [, jwt] = authHeader.split(' ')

    if (!jwt) {
        return null
    }

    return jwt
}

export default function extractAuth(request: Request, response: Response, next: NextFunction) {
    const jwt = extractJwt(request)

    if (!jwt) {
        return response.status(401).json({ message: 'a valid Authorization header with a Bearer jwt is required' })
    }

    // the jwt rides an AsyncLocalStorage context so tool handlers can
    // read it without threading it through the mcp sdk internals
    authContext.run({ jwt }, () => next())
}