import axios, { type AxiosInstance } from 'axios'
import config from 'config'
import { getJwt } from '../middleware/auth-context.js'

// the mcp server never validates the jwt itself - it forwards it,
// and the backend remains the single source of truth for auth
export function createBackendClient(jwt?: string): AxiosInstance {
    const token = jwt ?? getJwt()

    return axios.create({
        baseURL: config.get<string>('backend.url'),
        headers: {
            Authorization: `Bearer ${token}`,
            'x-client-id': 'mcp',
        },
    })
}

export interface ListVacationsParams {
    filter?: 'all' | 'liked' | 'active' | 'upcoming'
    offset?: number
    limit?: number
}

export async function getVacations(params: ListVacationsParams = {}, jwt?: string) {
    const client = createBackendClient(jwt)
    const { data } = await client.get('/vacations', {
        params: {
            filter: params.filter ?? 'all',
            offset: params.offset ?? 0,
            limit: params.limit ?? 1000,
        }
    })
    return data
}