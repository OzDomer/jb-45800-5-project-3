import type { Request, Response } from "express"
import * as z from 'zod'
import bodyValidation from "./body-validation"

// a small schema exercising both jobs of the middleware:
// coercion (form fields arrive as strings) and friendly failure
const schema = z.object({
    price: z.coerce.number('price must be a number').min(1, 'price must be at least 1'),
})

describe('body validation middleware tests', () => {
    it('writes the parsed, COERCED value back onto the request', async () => {
        const request = { body: { price: '42' } } as Request
        const next = jest.fn()

        await bodyValidation(schema)(request, {} as Response, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0]).toBeUndefined()
        // the string became a number - controllers never see raw form strings
        expect(request.body).toEqual({ price: 42 })
    })

    it('rejects invalid input with 422 and the schema\'s own friendly message', async () => {
        const request = { body: { price: '0' } } as Request
        const next = jest.fn()

        await bodyValidation(schema)(request, {} as Response, next)

        expect(next.mock.calls[0][0]).toEqual({
            status: 422,
            message: 'price must be at least 1'
        })
    })

    it('strips fields that are not part of the schema', async () => {
        const request = { body: { price: '5', role: 'admin' } } as Request
        const next = jest.fn()

        await bodyValidation(schema)(request, {} as Response, next)

        // a client cannot smuggle extra fields (e.g. role) past validation
        expect(request.body).toEqual({ price: 5 })
    })
})