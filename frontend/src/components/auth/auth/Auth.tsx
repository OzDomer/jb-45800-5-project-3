import { useState, type PropsWithChildren } from "react"
import { v4 } from "uuid"
import AuthContext from "./AuthContext"

export default function Auth(props: PropsWithChildren) {

    const JWT_KEY_NAME = 'jwt'

    const [jwt, setJwt] = useState<string>(localStorage.getItem(JWT_KEY_NAME) || '')

    // identifies this browser tab against socket echo (x-client-id header)
    const [clientId] = useState<string>(v4())

    const { children } = props

    function saveJwt(jwt: string) {
        setJwt(jwt)
        localStorage.setItem(JWT_KEY_NAME, jwt)
    }

    function logout() {
        localStorage.removeItem(JWT_KEY_NAME)
        setJwt('')
    }

    return (
        <AuthContext.Provider value={{ jwt, saveJwt, logout, clientId }}>
            {children}
        </AuthContext.Provider>
    )
}