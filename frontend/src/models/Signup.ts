import type Login from "./Login";

export default interface Signup extends Login {
    firstName: string,
    lastName: string
}