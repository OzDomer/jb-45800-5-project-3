import type Role from "./Role";

export default interface User {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    role: Role
}