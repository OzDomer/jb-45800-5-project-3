import { randomUUID } from "crypto"
import { compare } from "bcryptjs"
import { hashPassword } from "./controller"

describe('auth controller tests', () => {
    describe('hashPassword tests', () => {
        it('returns a bcrypt-formatted hash', async () => {
            const result = await hashPassword(randomUUID())

            // $2b$ = bcrypt, $10$ = 2^10 rounds, 60 chars total
            expect(result).toBeDefined()
            expect(result).toHaveLength(60)
            expect(result).toMatch(/^\$2[aby]\$10\$/)
        })

        it('returns DIFFERENT hashes for the same input - the per-user salt at work', async () => {
            // this is the opposite guarantee of a keyed hash (HMAC), where the
            // same password always produces the same hash. with bcrypt, two
            // users sharing a password still store different hashes.
            const password = randomUUID()
            const hash1 = await hashPassword(password)
            const hash2 = await hashPassword(password)

            expect(hash1).not.toEqual(hash2)
        })

        it('verifies the right password against either hash', async () => {
            const password = randomUUID()
            const hash1 = await hashPassword(password)
            const hash2 = await hashPassword(password)

            // compare extracts the salt from each stored hash and re-derives
            expect(await compare(password, hash1)).toBe(true)
            expect(await compare(password, hash2)).toBe(true)
        })

        it('rejects a wrong password', async () => {
            const hash = await hashPassword(randomUUID())

            expect(await compare('not-the-password', hash)).toBe(false)
        })
    })
})