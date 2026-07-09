import * as z from 'zod'

export const loginValidator = z.object({
    email: z.email('please enter a valid email'),
    password: z.string('password is required').min(4, 'password must be at least 4 characters'),
})

export const signupValidator = loginValidator.extend({
    firstName: z.string('first name is required').trim().min(1, 'first name is required').max(30, 'first name must be at most 30 characters'),
    lastName: z.string('last name is required').trim().min(1, 'last name is required').max(30, 'last name must be at most 30 characters'),
})