import type { NextFunction, Request, Response } from "express";
import { isAiConfigured } from "../openai/openai";

// the whole app must keep working without an openai key -
// only AI endpoints refuse, with a clear message
export default function aiConfigured(request: Request, response: Response, next: NextFunction) {
    if (!isAiConfigured()) return next({
        status: 503,
        message: 'AI features are not configured on this server'
    })

    next()
}