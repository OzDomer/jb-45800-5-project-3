import './EditVacation.css'
import '../add/AddVacation.css'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type VacationDraft from '../../../models/VacationDraft'
import useService from '../../../hooks/use-service'
import VacationsService from '../../../services/auth-aware/VacationsService'
import SpinnerButton from '../../common/spinner-button/SpinnerButton'
import { showErrorToast } from '../../common/show-error-toast'

export default function EditVacation() {

    const { vacationId } = useParams<'vacationId'>()
    const navigate = useNavigate()
    const vacationsService = useService(VacationsService)

    const [previewImage, setPreviewImage] = useState<string>('')

    const { register, handleSubmit, formState, getValues, reset } = useForm<VacationDraft>()

    // prefill the form with the existing vacation, including its current image
    useEffect(() => {
        (async () => {
            try {
                const { destination, description, startDate, endDate, price, imageUrl } = await vacationsService.getSingleVacation(vacationId!)
                reset({ destination, description, startDate, endDate, price })
                setPreviewImage(imageUrl)
            } catch (e) {
                showErrorToast(e)
            }
        })()
    }, [vacationId, reset])

    // register first, then compose onChange (see AddVacation for why)
    const imageRegister = register('image')

    function imageChanged(event: ChangeEvent<HTMLInputElement>) {
        imageRegister.onChange(event)
        const file = event.currentTarget.files?.[0]
        if (file) setPreviewImage(URL.createObjectURL(file))
    }

    async function updateVacation(draft: VacationDraft) {
        try {
            const newImage = (draft.image as FileList)?.[0]

            // the image is optional on edit - only send it when replaced
            if (newImage) {
                draft.image = newImage
            } else {
                delete draft.image
            }

            await vacationsService.updateVacation(vacationId!, draft)
            navigate('/admin')
        } catch (e) {
            showErrorToast(e)
        }
    }

    return (
        <div className='EditVacation'>
            <form className='VacationForm' onSubmit={handleSubmit(updateVacation)}>
                <h2>Edit Vacation</h2>

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

                {/* past dates are allowed here - vacations that already ended can be edited */}
                <label>start on</label>
                <input type='date' {...register('startDate', {
                    required: {
                        value: true,
                        message: 'start date is a required field'
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

                <label>cover image (leave empty to keep the current one)</label>
                <input type='file' accept='image/jpeg, image/png' {...imageRegister} onChange={imageChanged} />

                {previewImage && <img className='VacationForm-preview' src={previewImage} />}

                <SpinnerButton
                    buttonText='Update'
                    spinningText='updating vacation...'
                    isSpinning={formState.isSubmitting}
                />

                <button type='button' className='VacationForm-cancel' onClick={() => navigate('/admin')}>Cancel</button>
            </form>
        </div>
    )
}