import type { NextFunction, Request, Response } from "express";
import { Role } from "../models/enums";

// must run after authEnforce, which loads request.userRole
export default function adminEnforce(request: Request, response: Response, next: NextFunction) {
    if (request.userRole !== Role.Admin) return next({
        status: 403,
        message: 'this action requires an admin account'
    })

    next()
}