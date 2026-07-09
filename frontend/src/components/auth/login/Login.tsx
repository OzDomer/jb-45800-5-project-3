import './Login.css'
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { jwtDecode } from 'jwt-decode'
import type LoginModel from '../../../models/Login'
import type User from '../../../models/User'
import Role from '../../../models/Role'
import authService from '../../../services/auth'
import AuthContext from '../auth/AuthContext'
import { showErrorToast } from '../../common/show-error-toast'
import SpinnerButton from '../../common/spinner-button/SpinnerButton'

export default function Login() {

    const { saveJwt } = useContext(AuthContext)!
    const navigate = useNavigate()

    async function login(login: LoginModel) {
        try {
            const { jwt } = await authService.login(login)
            saveJwt(jwt)

            const { role } = jwtDecode<User>(jwt)
            navigate(role === Role.Admin ? '/admin' : '/vacations')
        } catch (e) {
            showErrorToast(e)
        }
    }

    const { register, handleSubmit, formState } = useForm<LoginModel>()

    return (
        <div className='Login'>
            <form onSubmit={handleSubmit(login)}>
                <h2>Login</h2>

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
                    buttonText='Login'
                    spinningText='logging in...'
                    isSpinning={formState.isSubmitting}
                />

                <p className='switch-auth'>don't have an account? <Link to='/register'>register now</Link></p>
            </form>
        </div>
    )
}