import type { PropsWithChildren } from "react"
import { Navigate } from "react-router-dom"
import useUser from "../../../hooks/use-user"
import Role from "../../../models/Role"

// must be nested inside RequireAuth - it only checks the role
export default function RequireAdmin(props: PropsWithChildren) {
    const user = useUser()

    const { children } = props

    if (user?.role !== Role.Admin) return <Navigate to="/vacations" />

    return <>{children}</>
}