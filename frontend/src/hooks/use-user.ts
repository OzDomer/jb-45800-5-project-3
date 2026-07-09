import { useContext, useMemo } from "react"
import { jwtDecode } from "jwt-decode"
import AuthContext from "../components/auth/auth/AuthContext"
import type User from "../models/User"

export default function useUser(): User | null {
    const { jwt } = useContext(AuthContext)!

    return useMemo(() => {
        if (!jwt) return null
        return jwtDecode<User>(jwt)
    }, [jwt])
}