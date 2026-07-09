import type { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import config from 'config'
import { Role } from "../models/enums";

// this is a directive for the TS compiler
// to let it know that whenever it compiles an interface
// named Request that is under Express
// it should allow the usage of the properties below
// this is like extending the Express Request object
declare global {
    namespace Express {
        interface Request {
            userId: string
            userRole: Role
        }
    }
}

export default function authEnforce(request: Request, response: Response, next: NextFunction) {
    // this middleware objectives are:
    // extract the jwt from the headers
    // realize from the jwt who is the user
    // get their userId and role, and load them on the request
    // so any middleware that runs after me
    // can access them using request.userId / request.userRole
    const authHeader = request.get('Authorization')

    if (!authHeader) return next({
        status: 401,
        message: 'you must be logged in to perform this action'
    })

    if (!authHeader.startsWith('Bearer')) return next({
        status: 401,
        message: 'you probably use the wrong auth mechanism'
    })

    const [, jwt] = authHeader.split(' ')

    if (!jwt) return next({
        status: 401,
        message: 'you must be logged in to perform this action'
    })

    const key = config.get<string>('app.encryptionKey')

    try {
        const { id, role } = verify(jwt, key) as { id: string, role: Role }
        request.userId = id
        request.userRole = role
    } catch {
        return next({
            status: 401,
            message: 'your session is invalid or expired, please log in again'
        })
    }

    next()
}