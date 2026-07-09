// minimal typing for the google identity services script
// https://developers.google.com/identity/gsi/web
interface GoogleCredentialResponse {
    credential: string
}

interface Window {
    google?: {
        accounts: {
            id: {
                initialize(config: {
                    client_id: string,
                    callback: (response: GoogleCredentialResponse) => void
                }): void
                renderButton(parent: HTMLElement, options: {
                    theme?: 'outline' | 'filled_blue' | 'filled_black',
                    size?: 'large' | 'medium' | 'small',
                    width?: number,
                    locale?: string
                }): void
            }
        }
    }
}