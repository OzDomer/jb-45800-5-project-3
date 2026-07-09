import '../login/Login.css'
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type Signup from '../../../models/Signup'
import authService from '../../../services/auth'
import AuthContext from '../auth/AuthContext'
import { showErrorToast } from '../../common/show-error-toast'
import SpinnerButton from '../../common/spinner-button/SpinnerButton'

export default function Register() {

    const { saveJwt } = useContext(AuthContext)!
    const navigate = useNavigate()

    async function signup(signup: Signup) {
        try {
            const { jwt } = await authService.signup(signup)
            saveJwt(jwt)
            navigate('/vacations')
        } catch (e) {
            // taken email arrives here as a friendly 409 message
            showErrorToast(e)
        }
    }

    const { register, handleSubmit, formState } = useForm<Signup>()

    return (
        <div className='Register'>
            <form onSubmit={handleSubmit(signup)}>
                <h2>Register</h2>

                <input placeholder='first name' {...register('firstName', {
                    required: {
                        value: true,
                        message: 'first name is a required field'
                    },
                    maxLength: {
                        value: 30,
                        message: 'first name must be at most 30 characters'
                    }
                })} />
                <div className='error'>{formState.errors.firstName?.message}</div>

                <input placeholder='last name' {...register('lastName', {
                    required: {
                        value: true,
                        message: 'last name is a required field'
                    },
                    maxLength: {
                        value: 30,
                        message: 'last name must be at most 30 characters'
                    }
                })} />
                <div className='error'>{formState.errors.lastName?.message}</div>

                <input placeholder='email' {...register('email', {
                    required: {
                        value: true,
                        message: 'email is a required field'
                    },
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'please enter a valid email'
                    }
                })} />
                <div className='error'>{formState.errors.email?.message}</div>

                <input type='password' placeholder='password' {...register('password', {
                    required: {
                        value: true,
                        message: 'password is a required field'
                    },
                    minLength: {
                        value: 4,
                        message: 'password must be at least 4 characters'
                    }
                })} />
                <div className='error'>{formState.errors.password?.message}</div>

                <SpinnerButton
                    buttonText='Register'
                    spinningText='creating your account...'
                    isSpinning={formState.isSubmitting}
                />

                <p className='switch-auth'>already a member? <Link to='/login'>login</Link></p>
            </form>
        </div>
    )
}