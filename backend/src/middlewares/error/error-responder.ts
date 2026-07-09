
import type { NextFunction, Request, Response } from "express";

export default function respondError(err: any, request: Request, response: Response, next: NextFunction) {
    const status = err.status || 500

    // deliberate errors (4xx with a message) carry a friendly, user-facing text.
    // anything unexpected gets a generic message with the event id for support.
    const message = (status < 500 && err.message)
        ? err.message
        : `something went wrong on our side... please contact support with event id ${request.eventId}`

    response.status(status).send(message)
}