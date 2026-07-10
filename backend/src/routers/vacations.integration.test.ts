// integration tests run against the REAL dockerized mysql with the
// standard seed (12 vacations, user1 has 5 likes). externals are mocked.
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
import { sign } from 'jsonwebtoken'
import config from 'config'
import app, { init } from "../app"
import sequelize from '../db/sequelize'
import User from '../models/User'
import Like from '../models/Like'
import { Role } from '../models/enums'

const key = config.get<string>('app.encryptionKey')

// resolved from the seed at runtime - looking the user up by email (and
// counting likes from the table) survives a seed regeneration, where a
// hardcoded id or count would silently rot
let userId: string
let userJwt: string
let seededLikesCount: number

// the like round-trip cleans up after itself when it PASSES; this guard
// cleans up when it fails mid-way, so one red run cannot leak a row into
// the shared seeded db and poison every run after it
let likedVacationId: string | null = null

interface VacationRow {
    id: string
    destination: string
    startDate: string
    endDate: string
    price: number
    likesCount: number
    likedByMe: boolean
}

function get(url: string) {
    return request(app).get(url).set('Authorization', `Bearer ${userJwt}`)
}

beforeAll(async () => {
    await init()

    const user1 = await User.findOne({ where: { email: 'user1@otherworld.com' } })
    if (!user1) throw new Error('seeded user1@otherworld.com not found - is the database seeded?')

    userId = user1.id
    userJwt = sign({ id: userId, role: Role.User }, key, { expiresIn: '1h' })
    seededLikesCount = await Like.count({ where: { userId } })
})

afterEach(async () => {
    if (likedVacationId) {
        await Like.destroy({ where: { userId, vacationId: likedVacationId } })
        likedVacationId = null
    }
})

afterAll(async () => {
    await sequelize.close()
})

describe('vacations router integration tests', () => {
    describe('GET /vacations', () => {
        it('rejects requests without a token', async () => {
            const response = await request(app).get('/vacations')

            expect(response.statusCode).toBe(401)
            expect(response.text).toBe('you must be logged in to perform this action')
        })

        it('returns the 12 seeded vacations sorted by start date', async () => {
            const response = await get('/vacations?limit=100')
            const vacations: VacationRow[] = response.body

            expect(response.statusCode).toBe(200)
            expect(vacations).toHaveLength(12)

            const starts = vacations.map(v => v.startDate)
            expect(starts).toEqual([...starts].sort())
        })

        it('serializes price as a number and includes the likes fields', async () => {
            const response = await get('/vacations?limit=1')
            const [vacation]: VacationRow[] = response.body

            expect(typeof vacation.price).toBe('number')
            expect(typeof vacation.likesCount).toBe('number')
            expect(typeof vacation.likedByMe).toBe('boolean')
        })

        it('respects limit and offset for pagination', async () => {
            const all = (await get('/vacations?limit=100')).body as VacationRow[]
            const secondPage = (await get('/vacations?limit=3&offset=3')).body as VacationRow[]

            expect(secondPage).toHaveLength(3)
            expect(secondPage.map(v => v.id)).toEqual(all.slice(3, 6).map(v => v.id))
        })

        it('filter=liked returns exactly the seeded likes of user1', async () => {
            const response = await get('/vacations?filter=liked&limit=100')
            const vacations: VacationRow[] = response.body

            expect(vacations).toHaveLength(seededLikesCount)
            expect(vacations.length).toBeGreaterThan(0)
            expect(vacations.every(v => v.likedByMe)).toBe(true)
        })

        it('date filters agree with the UTC-today convention (computed, not hardcoded)', async () => {
            // hardcoding counts would rot as dates pass - compute the expected
            // sets from the seed data using the same UTC convention as the api
            const all = (await get('/vacations?limit=100')).body as VacationRow[]
            const today = new Date().toISOString().slice(0, 10)

            const expectedActive = all.filter(v => v.startDate <= today && v.endDate >= today)
            const expectedUpcoming = all.filter(v => v.startDate > today)

            const active = (await get('/vacations?filter=active&limit=100')).body as VacationRow[]
            const upcoming = (await get('/vacations?filter=upcoming&limit=100')).body as VacationRow[]

            expect(active.map(v => v.id).sort()).toEqual(expectedActive.map(v => v.id).sort())
            expect(upcoming.map(v => v.id).sort()).toEqual(expectedUpcoming.map(v => v.id).sort())
        })

        it('rejects an unknown filter with the validator message', async () => {
            const response = await get('/vacations?filter=nope')

            expect(response.statusCode).toBe(422)
            expect(response.text).toBe('unknown vacations filter')
        })
    })

    describe('like / unlike', () => {
        it('full round trip: like, see it in the list, unlike, gone again', async () => {
            // pick a vacation user1 has NOT liked, dynamically - never hardcode state
            const all = (await get('/vacations?limit=100')).body as VacationRow[]
            const target = all.find(v => !v.likedByMe)!
            expect(target).toBeDefined()

            // registered BEFORE the like, so a failure anywhere below still cleans up
            likedVacationId = target.id

            const like = await request(app)
                .post(`/vacations/${target.id}/like`)
                .set('Authorization', `Bearer ${userJwt}`)
            expect(like.statusCode).toBe(200)

            let refreshed = (await get('/vacations?limit=100')).body as VacationRow[]
            let row = refreshed.find(v => v.id === target.id)!
            expect(row.likedByMe).toBe(true)
            expect(row.likesCount).toBe(target.likesCount + 1)

            // liking twice is a harmless no-op
            const duplicate = await request(app)
                .post(`/vacations/${target.id}/like`)
                .set('Authorization', `Bearer ${userJwt}`)
            expect(duplicate.statusCode).toBe(200)

            const unlike = await request(app)
                .delete(`/vacations/${target.id}/like`)
                .set('Authorization', `Bearer ${userJwt}`)
            expect(unlike.statusCode).toBe(200)

            refreshed = (await get('/vacations?limit=100')).body as VacationRow[]
            row = refreshed.find(v => v.id === target.id)!
            expect(row.likedByMe).toBe(false)
            expect(row.likesCount).toBe(target.likesCount)
        })

        it('unliking something never liked answers a friendly 404', async () => {
            const all = (await get('/vacations?limit=100')).body as VacationRow[]
            const notLiked = all.find(v => !v.likedByMe)!

            const response = await request(app)
                .delete(`/vacations/${notLiked.id}/like`)
                .set('Authorization', `Bearer ${userJwt}`)

            expect(response.statusCode).toBe(404)
            expect(response.text).toBe('you have not liked this vacation')
        })
    })

    describe('admin guard', () => {
        it('a regular user cannot delete a vacation', async () => {
            const all = (await get('/vacations?limit=100')).body as VacationRow[]

            const response = await request(app)
                .delete(`/vacations/${all[0].id}`)
                .set('Authorization', `Bearer ${userJwt}`)

            expect(response.statusCode).toBe(403)
            expect(response.text).toBe('this action requires an admin account')
        })
    })
})