import type { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export default function filesValidation(validator: ZodType) {
    return async (request: Request, response: Response, next: NextFunction) => {
        // request.files is null/undefined when no multipart files arrived -
        // normalize to an empty object so "required file" schemas fail
        // with their own friendly message
        const result = await validator.safeParseAsync(request.files ?? {})

        if (!result.success) {
            return next({
                status: 422,
                message: result.error.issues[0]?.message || 'unprocessable entity'
            })
        }

        next()
    }
}