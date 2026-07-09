import type { PropsWithChildren } from "react"
import { Navigate } from "react-router-dom"
import useUser from "../../../hooks/use-user"
import Role from "../../../models/Role"

// login/register make no sense for logged-in users -
// send them to their home page instead
export default function GuestOnly(props: PropsWithChildren) {
    const user = useUser()

    const { children } = props

    if (user) return <Navigate to={user.role === Role.Admin ? '/admin' : '/vacations'} />

    return <>{children}</>
}