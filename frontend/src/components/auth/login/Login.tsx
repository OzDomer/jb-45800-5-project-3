import './Login.css'
import { useContext, useEffect, useRef } from 'react'
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

// hl pins the button language - without it the widget follows the
// system locale regardless of the renderButton locale option
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client?hl=en'

export default function Login() {

    const { saveJwt } = useContext(AuthContext)!
    const navigate = useNavigate()

    const googleButtonRef = useRef<HTMLDivElement>(null)

    function enterWithJwt(jwt: string) {
        saveJwt(jwt)
        const { role } = jwtDecode<User>(jwt)
        navigate(role === Role.Admin ? '/admin' : '/vacations')
    }

    async function login(login: LoginModel) {
        try {
            const { jwt } = await authService.login(login)
            enterWithJwt(jwt)
        } catch (e) {
            showErrorToast(e)
        }
    }

    // google sign-in: the GIS script renders the button and hands us an
    // id token; our backend verifies it and answers with the same jwt
    // shape as a classic login
    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

        if (!clientId || !googleButtonRef.current) return

        async function onGoogleCredential(response: GoogleCredentialResponse) {
            try {
                const { jwt } = await authService.google(response.credential)
                enterWithJwt(jwt)
            } catch (e) {
                showErrorToast(e)
            }
        }

        function renderGoogleButton() {
            window.google?.accounts.id.initialize({
                client_id: clientId,
                callback: onGoogleCredential
            })
            window.google?.accounts.id.renderButton(googleButtonRef.current!, {
                theme: 'outline',
                size: 'large',
                width: 256,
                locale: 'en'
            })
        }

        if (window.google?.accounts) {
            renderGoogleButton()
            return
        }

        let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`)

        if (!script) {
            script = document.createElement('script')
            script.src = GSI_SCRIPT_SRC
            script.async = true
            document.head.appendChild(script)
        }

        script.addEventListener('load', renderGoogleButton)

        return () => {
            script?.removeEventListener('load', renderGoogleButton)
        }
    }, [])

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

                <div className='Login-divider'>or</div>

                <div className='Login-google' ref={googleButtonRef}></div>

                <p className='switch-auth'>don't have an account? <Link to='/register'>register now</Link></p>
            </form>
        </div>
    )
}