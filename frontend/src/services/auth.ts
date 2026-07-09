import axios from "axios"
import type Jwt from "../models/Jwt"
import type Login from "../models/Login"
import type Signup from "../models/Signup"

class AuthService {

    async login(login: Login): Promise<Jwt> {
        const { data } = await axios.post<Jwt>(`${import.meta.env.VITE_REST_SERVER_URL}/auth/login`, login)
        return data
    }

    async signup(signup: Signup): Promise<Jwt> {
        const { data } = await axios.post<Jwt>(`${import.meta.env.VITE_REST_SERVER_URL}/auth/signup`, signup)
        return data
    }

    async google(credential: string): Promise<Jwt> {
        const { data } = await axios.post<Jwt>(`${import.meta.env.VITE_REST_SERVER_URL}/auth/google`, { credential })
        return data
    }

}

const authService = new AuthService()
export default authService