import { useContext } from "react";
import axios, { type AxiosInstance } from "axios";
import AuthContext from "../components/auth/auth/AuthContext";
import type AuthAwareService from "../services/auth-aware/AuthAware";

export default function useService<T extends AuthAwareService>(Service: { new(axiosInstance: AxiosInstance): T }): T {
    const { jwt, clientId } = useContext(AuthContext)!

    const axiosInstance = axios.create({
        headers: {
            Authorization: `Bearer ${jwt}`,
            'x-client-id': clientId
        },
        baseURL: import.meta.env.VITE_REST_SERVER_URL
    })

    return new Service(axiosInstance)
}