import type { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

// express 5 exposes request.query through a read-only getter,
// so the parsed result is stored on request.validatedQuery instead
declare global {
    namespace Express {
        interface Request {
            validatedQuery: unknown
        }
    }
}

export default function queryValidation(validator: ZodType) {
    return async (request: Request, response: Response, next: NextFunction) => {
        const result = await validator.safeParseAsync(request.query)

        if (!result.success) {
            return next({
                status: 422,
                message: result.error.issues[0]?.message || 'unprocessable entity'
            })
        }

        request.validatedQuery = result.data
        next()
    }
}