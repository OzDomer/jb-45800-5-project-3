import type { Request, Response } from "express"
import { sign } from "jsonwebtoken"
import { randomUUID } from "crypto"
import config from 'config'
import authEnforce from "./auth-enforce"
import { Role } from "../models/enums"

// authEnforce is a middleware - in production only express invokes it.
// to unit test it we play express ourselves: a hand-mocked request,
// an empty response, and jest.fn() as next so we can inspect the calls.
function mockRequest(authHeader: string): Request {
    return {
        get: (): string => authHeader
    } as unknown as Request
}

describe('auth enforcement tests', () => {
    const key = config.get<string>('app.encryptionKey')

    it('returns 401 with a friendly message when the auth header is missing', () => {
        const request = mockRequest('')
        const next = jest.fn()

        authEnforce(request, {} as Response, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0]).toEqual({
            status: 401,
            message: 'you must be logged in to perform this action'
        })
    })

    it('returns 401 when the auth scheme is not Bearer', () => {
        const request = mockRequest('Basic dXNlcjpwYXNz')
        const next = jest.fn()

        authEnforce(request, {} as Response, next)

        expect(next.mock.calls[0][0]).toEqual({
            status: 401,
            message: 'you probably use the wrong auth mechanism'
        })
    })

    it('returns 401 when no token follows the Bearer word', () => {
        const request = mockRequest('Bearertokenwithoutspace')
        const next = jest.fn()

        authEnforce(request, {} as Response, next)

        expect(next.mock.calls[0][0]).toEqual({
            status: 401,
            message: 'you must be logged in to perform this action'
        })
    })

    it('returns 401 for an EXPIRED token - sessions have a lifetime', () => {
        const expired = sign({ id: randomUUID(), role: Role.User }, key, { expiresIn: -60 })
        const request = mockRequest(`Bearer ${expired}`)
        const next = jest.fn()

        authEnforce(request, {} as Response, next)

        expect(next.mock.calls[0][0]).toEqual({
            status: 401,
            message: 'your session is invalid or expired, please log in again'
        })
    })

    it('returns 401 for a token signed with the wrong key', () => {
        const forged = sign({ id: randomUUID(), role: Role.Admin }, 'not-the-real-key')
        const request = mockRequest(`Bearer ${forged}`)
        const next = jest.fn()

        authEnforce(request, {} as Response, next)

        expect(next.mock.calls[0][0]).toEqual({
            status: 401,
            message: 'your session is invalid or expired, please log in again'
        })
    })

    it('loads userId AND userRole onto the request when the token is valid', () => {
        const userId = randomUUID()
        const jwt = sign({ id: userId, role: Role.Admin }, key, { expiresIn: '1h' })
        const request = mockRequest(`Bearer ${jwt}`)
        const next = jest.fn()

        authEnforce(request, {} as Response, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0]).toBeUndefined()
        expect(request.userId).toEqual(userId)
        expect(request.userRole).toEqual(Role.Admin)
    })
})