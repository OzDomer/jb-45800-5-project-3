import type { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export default function bodyValidation(validator: ZodType) {
    return async (request: Request, response: Response, next: NextFunction) => {
        // we push the validation result back into the request
        // because the validation may contain transformations
        // (e.g. coercing multipart string fields into numbers/dates)
        const result = await validator.safeParseAsync(request.body)

        if (!result.success) {
            return next({
                status: 422,
                message: result.error.issues[0]?.message || 'unprocessable entity'
            })
        }

        request.body = result.data
        next()
    }
}