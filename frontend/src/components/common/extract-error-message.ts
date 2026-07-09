import axios from 'axios'

const DEFAULT_MESSAGE = 'something went wrong, please try again'

function messageFromObject(value: object): string | undefined {
    const record = value as Record<string, unknown>

    if (typeof record.message === 'string' && record.message.trim()) {
        return record.message
    }

    if (typeof record.error === 'string' && record.error.trim()) {
        return record.error
    }
}

// the user must only ever see clear human text -
// never raw axios errors or status codes
export function extractErrorMessage(error: unknown): string {
    if (!error) {
        return DEFAULT_MESSAGE
    }

    if (typeof error === 'string' && error.trim()) {
        return error
    }

    if (axios.isAxiosError(error)) {
        const { response } = error

        if (response?.data !== undefined && response.data !== null) {
            const { data } = response

            if (typeof data === 'string' && data.trim()) {
                return data
            }

            if (typeof data === 'object') {
                const extracted = messageFromObject(data)
                if (extracted) {
                    return extracted
                }
            }
        }

        // no response at all means the server is unreachable
        if (!response) {
            return 'could not reach the server, please try again later'
        }

        return DEFAULT_MESSAGE
    }

    if (error instanceof Error && error.message) {
        return error.message
    }

    if (typeof error === 'object') {
        const extracted = messageFromObject(error)
        if (extracted) {
            return extracted
        }
    }

    return DEFAULT_MESSAGE
}