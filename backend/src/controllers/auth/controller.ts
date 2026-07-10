import type { NextFunction, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { hash, compare } from "bcryptjs";
import config from 'config'
import { UniqueConstraintError } from "sequelize";
import { OAuth2Client } from "google-auth-library";
import User from "../../models/User";

const googleClient = new OAuth2Client(config.get<string>('google.clientId'))

// bcrypt with a per-user random salt (embedded in the hash) and a work
// factor of 2^10 rounds - two users with the same password get different
// hashes, and brute-forcing is deliberately slow. see the README's
// "password storage" section for the full reasoning.
const BCRYPT_ROUNDS = 10

export function hashPassword(plainTextPassword: string): Promise<string> {
    return hash(plainTextPassword, BCRYPT_ROUNDS)
}

function generateJwt(user: User): string {
    // strip the password (even hashed) from the jwt payload
    const { password, ...payload } = user.get({ plain: true })
    // sessions expire - a leaked token is not a forever key. seven days fits
    // this threat model (content browsing, not banking); production would
    // move to short-lived access tokens with refresh rotation
    return sign(payload, config.get<string>('app.encryptionKey'), { expiresIn: '7d' })
}

export async function signup(request: Request<object, object, { firstName: string, lastName: string, email: string, password: string }>, response: Response, next: NextFunction) {
    try {
        request.body.password = await hashPassword(request.body.password)

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

        // salted hashes are not queryable - fetch by email, then compare.
        // users created via google sign-in have no password at all and
        // must fail classic login the same way as wrong credentials.
        const user = await User.findOne({ where: { email } })

        if (!user || !user.password || !(await compare(password, user.password))) return next({
            status: 401,
            message: 'wrong email or password'
        })

        response.json({ jwt: generateJwt(user) })
    } catch (e) {
        next(e)
    }
}

export async function google(request: Request<object, object, { credential: string }>, response: Response, next: NextFunction) {
    try {
        const { credential } = request.body

        // the google id token is verified server-side against our client id -
        // the backend stays the single source of truth for auth
        let payload
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: config.get<string>('google.clientId'),
            })
            payload = ticket.getPayload()
        } catch {
            return next({
                status: 401,
                message: 'google sign-in could not be verified, please try again'
            })
        }

        if (!payload?.email) {
            return next({
                status: 401,
                message: 'google sign-in did not provide an email address'
            })
        }

        // same email = same account, whether it was created with a password
        // or with google. google users are stored without a password.
        const [user] = await User.findOrCreate({
            where: { email: payload.email },
            defaults: {
                firstName: (payload.given_name || payload.email.split('@')[0]).slice(0, 30),
                lastName: (payload.family_name || '-').slice(0, 30),
                email: payload.email,
                password: null,
            }
        })

        response.json({ jwt: generateJwt(user) })
    } catch (e) {
        next(e)
    }
}