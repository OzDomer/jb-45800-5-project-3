import './AddVacation.css'
import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type VacationDraft from '../../../models/VacationDraft'
import useService from '../../../hooks/use-service'
import VacationsService from '../../../services/auth-aware/VacationsService'
import SpinnerButton from '../../common/spinner-button/SpinnerButton'
import { showErrorToast } from '../../common/show-error-toast'

function todayDateOnly(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export default function AddVacation() {

    const navigate = useNavigate()
    const vacationsService = useService(VacationsService)

    const [previewImage, setPreviewImage] = useState<string>('')

    const { register, handleSubmit, formState, getValues } = useForm<VacationDraft>()

    // register first, then compose onChange - assigning onChange after the
    // register spread would overwrite react-hook-form's handler and the
    // selected file would never reach the submitted draft
    const imageRegister = register('image', {
        required: {
            value: true,
            message: 'a vacation image is required'
        }
    })

    function imageChanged(event: ChangeEvent<HTMLInputElement>) {
        imageRegister.onChange(event)
        const file = event.currentTarget.files?.[0]
        if (file) setPreviewImage(URL.createObjectURL(file))
    }

    async function addVacation(draft: VacationDraft) {
        try {
            draft.image = (draft.image as FileList)[0]
            await vacationsService.createVacation(draft)
            navigate('/admin')
        } catch (e) {
            showErrorToast(e)
        }
    }

    return (
        <div className='AddVacation'>
            <form className='VacationForm' onSubmit={handleSubmit(addVacation)}>
                <h2>Add Vacation</h2>

                <label>destination</label>
                <input placeholder='destination' {...register('destination', {
                    required: {
                        value: true,
                        message: 'destination is a required field'
                    }
                })} />
                <div className='error'>{formState.errors.destination?.message}</div>

                <label>description</label>
                <textarea placeholder='description' rows={4} {...register('description', {
                    required: {
                        value: true,
                        message: 'description is a required field'
                    }
                })}></textarea>
                <div className='error'>{formState.errors.description?.message}</div>

                <label>start on</label>
                <input type='date' min={todayDateOnly()} {...register('startDate', {
                    required: {
                        value: true,
                        message: 'start date is a required field'
                    },
                    validate: {
                        notPast: (value) => value >= todayDateOnly() || 'start date cannot be in the past'
                    }
                })} />
                <div className='error'>{formState.errors.startDate?.message}</div>

                <label>end on</label>
                <input type='date' {...register('endDate', {
                    required: {
                        value: true,
                        message: 'end date is a required field'
                    },
                    validate: {
                        afterStart: (value) => value >= getValues('startDate') || 'end date cannot be before start date'
                    }
                })} />
                <div className='error'>{formState.errors.endDate?.message}</div>

                <label>price</label>
                <input type='number' step='0.01' placeholder='$' {...register('price', {
                    required: {
                        value: true,
                        message: 'price is a required field'
                    },
                    min: {
                        value: 0,
                        message: 'price cannot be negative'
                    },
                    max: {
                        value: 10000,
                        message: 'price must be at most 10,000'
                    }
                })} />
                <div className='error'>{formState.errors.price?.message}</div>

                <label>cover image</label>
                <input type='file' accept='image/jpeg, image/png' {...imageRegister} onChange={imageChanged} />
                <div className='error'>{(formState.errors.image as { message?: string })?.message}</div>

                {previewImage && <img className='VacationForm-preview' src={previewImage} />}

                <SpinnerButton
                    buttonText='Add Vacation'
                    spinningText='adding vacation...'
                    isSpinning={formState.isSubmitting}
                />

                <button type='button' className='VacationForm-cancel' onClick={() => navigate('/admin')}>Cancel</button>
            </form>
        </div>
    )
}