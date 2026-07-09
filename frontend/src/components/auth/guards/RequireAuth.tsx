import { useContext, type PropsWithChildren } from "react"
import { Navigate } from "react-router-dom"
import AuthContext from "../auth/AuthContext"

// pages behind this guard are only reachable by logged-in users;
// guests are redirected to the login page
export default function RequireAuth(props: PropsWithChildren) {
    const { jwt } = useContext(AuthContext)!

    const { children } = props

    if (!jwt) return <Navigate to="/login" />

    return <>{children}</>
}