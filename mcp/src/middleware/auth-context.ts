import { AsyncLocalStorage } from 'node:async_hooks'

interface AuthContextStore {
    jwt: string
}

export const authContext = new AsyncLocalStorage<AuthContextStore>()

export function getJwt(): string {
    const store = authContext.getStore()

    if (!store?.jwt) {
        throw new Error('jwt not found in auth context')
    }

    return store.jwt
}