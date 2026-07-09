
import type { NextFunction, Request, Response } from "express";

export default function respondError(err: any, request: Request, response: Response, next: NextFunction) {
    // deliberate errors are raised as next({ status, message }) and carry
    // a friendly, user-facing text. unexpected exceptions have no status -
    // those get a generic message with the event id for support.
    const isDeliberate = !!err.status && !!err.message

    response.status(err.status || 500).send(
        isDeliberate
            ? err.message
            : `something went wrong on our side... please contact support with event id ${request.eventId}`
    )
}