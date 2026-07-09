import toast from 'react-hot-toast'
import { extractErrorMessage } from './extract-error-message'

export function showErrorToast(error: unknown): void {
    toast.error(extractErrorMessage(error))
}