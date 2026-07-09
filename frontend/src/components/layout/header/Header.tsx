import "./Header.css"
import { useContext } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import AuthContext from "../../auth/auth/AuthContext"
import useUser from "../../../hooks/use-user"
import Role from "../../../models/Role"

export default function Header() {

    const user = useUser()
    const { logout } = useContext(AuthContext)!
    const navigate = useNavigate()

    function logMeOut() {
        logout()
        navigate('/login')
    }

    return (
        <div className="Header">
            <div className="Header-logo">
                <NavLink to="/">Otherworld</NavLink>
            </div>

            <nav className="Header-nav">
                {!user && <>
                    <NavLink to="/about">About</NavLink>
                    <NavLink to="/login">Login</NavLink>
                    <NavLink to="/register">Register</NavLink>
                </>}

                {user && user.role === Role.User && <>
                    <NavLink to="/vacations">Vacations</NavLink>
                    <NavLink to="/ai">AI Recommendation</NavLink>
                    <NavLink to="/assistant">Assistant</NavLink>
                    <NavLink to="/about">About</NavLink>
                </>}

                {user && user.role === Role.Admin && <>
                    <NavLink to="/admin">Admin</NavLink>
                    <NavLink to="/admin/reports">Reports</NavLink>
                    <NavLink to="/ai">AI Recommendation</NavLink>
                    <NavLink to="/assistant">Assistant</NavLink>
                    <NavLink to="/about">About</NavLink>
                </>}
            </nav>

            {user && <div className="Header-user">
                <span>Welcome {user.firstName} {user.lastName}</span>
                <button onClick={logMeOut}>Logout</button>
            </div>}
        </div>
    )
}