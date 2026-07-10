import { useContext } from "react";
import axios, { type AxiosInstance } from "axios";
import AuthContext from "../components/auth/auth/AuthContext";
import type AuthAwareService from "../services/auth-aware/AuthAware";

export default function useService<T extends AuthAwareService>(Service: { new(axiosInstance: AxiosInstance): T }): T {
    const { jwt, clientId, logout } = useContext(AuthContext)!

    const axiosInstance = axios.create({
        headers: {
            Authorization: `Bearer ${jwt}`,
            'x-client-id': clientId
        },
        baseURL: import.meta.env.VITE_REST_SERVER_URL
    })

    // a 401 on an authenticated call means the token is invalid or expired -
    // clear the session so RequireAuth routes back to the login page
    axiosInstance.interceptors.response.use(
        response => response,
        (error) => {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                logout()
            }
            return Promise.reject(error)
        }
    )

    return new Service(axiosInstance)
}