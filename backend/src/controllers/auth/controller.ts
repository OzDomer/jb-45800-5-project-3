import type { NextFunction, Request, Response } from "express";
import { createHmac } from "crypto";
import { sign } from "jsonwebtoken";
import config from 'config'
import { UniqueConstraintError } from "sequelize";
import User from "../../models/User";

export function hashPassword(plainTextPassword: string): string {
    if (!plainTextPassword) return
    const key = config.get<string>('app.encryptionKey')
    return createHmac('sha256', key).update(plainTextPassword).digest('hex')
}

function generateJwt(user: User): string {
    // strip the password (even hashed) from the jwt payload
    const { password, ...payload } = user.get({ plain: true })
    return sign(payload, config.get<string>('app.encryptionKey'))
}

export async function signup(request: Request<object, object, { firstName: string, lastName: string, email: string, password: string }>, response: Response, next: NextFunction) {
    try {
        request.body.password = hashPassword(request.body.password)

        const newUser = await User.create(request.body)

        response.json({ jwt: generateJwt(newUser) })
    } catch (e) {
        if (e instanceof UniqueConstraintError) {
            return next({
                status: 409,
                message: 'this email is already registered'
            })
        }
        next(e)
    }
}

export async function login(request: Request<object, object, { email: string, password: string }>, response: Response, next: NextFunction) {
    try {
        const { email, password } = request.body

        const user = await User.findOne({
            where: {
                email,
                password: hashPassword(password)
            }
        })

        if (!user) return next({
            status: 401,
            message: 'wrong email or password'
        })

        response.json({ jwt: generateJwt(user) })
    } catch (e) {
        next(e)
    }
}