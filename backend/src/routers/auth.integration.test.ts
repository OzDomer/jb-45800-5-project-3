// integration tests run against the REAL dockerized mysql
// (docker compose up -d database). externals are mocked out:
// the socket relay and the s3 bucket are not what we test here.
jest.mock('../io/io', () => ({
    __esModule: true,
    default: { emit: jest.fn(), on: jest.fn() },
}))

jest.mock('../aws/aws', () => ({
    __esModule: true,
    default: {},
    createAppBucketIfNotExist: jest.fn(),
    uploadSeedImagesIfMissing: jest.fn(),
    buildPublicUrl: (key: string) => `http://test-bucket/${key}`,
}))

import request from 'supertest'
import { Op } from 'sequelize'
import app, { init } from "../app"
import sequelize from '../db/sequelize'
import User from '../models/User'

const email = `jest-${Date.now()}@test.com`

function decodeJwtPayload(jwt: string): Record<string, unknown> {
    return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString())
}

beforeAll(async () => {
    await init()
})

afterAll(async () => {
    // remove every user this suite created
    await User.destroy({ where: { email: { [Op.like]: 'jest-%' } } })
    await sequelize.close()
})

describe('auth router integration tests', () => {
    describe('POST /auth/signup', () => {
        it('registers a new user and returns a jwt without the password', async () => {
            const response = await request(app).post('/auth/signup').send({
                firstName: 'Jest',
                lastName: 'Runner',
                email,
                password: 'test1234',
            })

            expect(response.statusCode).toBe(200)
            expect(response.body.jwt).toBeDefined()

            const payload = decodeJwtPayload(response.body.jwt)
            expect(payload.email).toBe(email)
            expect(payload.role).toBe('user')
            expect(payload.password).toBeUndefined()
            expect(payload.exp).toBeDefined() // sessions expire
        })

        it('rejects a taken email with a friendly 409', async () => {
            const response = await request(app).post('/auth/signup').send({
                firstName: 'Jest',
                lastName: 'Duplicate',
                email,
                password: 'test1234',
            })

            expect(response.statusCode).toBe(409)
            expect(response.text).toBe('this email is already registered')
        })

        it('rejects an invalid email with the validator message', async () => {
            const response = await request(app).post('/auth/signup').send({
                firstName: 'Jest',
                lastName: 'Invalid',
                email: 'not-an-email',
                password: 'test1234',
            })

            expect(response.statusCode).toBe(422)
            expect(response.text).toBe('please enter a valid email')
        })
    })

    describe('POST /auth/login', () => {
        it('rejects wrong credentials without revealing which part was wrong', async () => {
            const response = await request(app).post('/auth/login').send({
                email,
                password: 'wrong-password',
            })

            expect(response.statusCode).toBe(401)
            expect(response.text).toBe('wrong email or password')
        })

        it('logs the new user in through the bcrypt compare path', async () => {
            const response = await request(app).post('/auth/login').send({
                email,
                password: 'test1234',
            })

            expect(response.statusCode).toBe(200)
            expect(response.body.jwt).toBeDefined()
        })

        it('logs the seeded admin in with the admin role in the jwt', async () => {
            const response = await request(app).post('/auth/login').send({
                email: 'admin@otherworld.com',
                password: 'admin1234',
            })

            expect(response.statusCode).toBe(200)
            expect(decodeJwtPayload(response.body.jwt).role).toBe('admin')
        })
    })
})