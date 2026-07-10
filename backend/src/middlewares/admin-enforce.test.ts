import type { Request, Response } from "express"
import adminEnforce from "./admin-enforce"
import { Role } from "../models/enums"

describe('admin enforcement tests', () => {
    it('returns 403 with a friendly message for a regular user', () => {
        const request = { userRole: Role.User } as Request
        const next = jest.fn()

        adminEnforce(request, {} as Response, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0]).toEqual({
            status: 403,
            message: 'this action requires an admin account'
        })
    })

    it('passes an admin through cleanly', () => {
        const request = { userRole: Role.Admin } as Request
        const next = jest.fn()

        adminEnforce(request, {} as Response, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0]).toBeUndefined()
    })
})