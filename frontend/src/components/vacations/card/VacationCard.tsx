import './VacationCard.css'
import { useState } from 'react'
import type Vacation from '../../../models/Vacation'
import { displayDate } from '../../../utils/dates'
import useService from '../../../hooks/use-service'
import VacationsService from '../../../services/auth-aware/VacationsService'
import { useAppDispatch } from '../../../redux/hooks'
import { like, unlike } from '../../../redux/vacations-slice'
import { showErrorToast } from '../../common/show-error-toast'

interface VacationCardProps {
    vacation: Vacation,
    isAdmin: boolean
}
export default function VacationCard(props: VacationCardProps) {

    const { vacation, isAdmin } = props
    const { id, destination, description, startDate, endDate, price, imageUrl, likesCount, likedByMe } = vacation

    const [isToggling, setIsToggling] = useState<boolean>(false)

    const vacationsService = useService(VacationsService)
    const dispatch = useAppDispatch()

    async function toggleLike() {
        if (isToggling) return
        setIsToggling(true)

        // optimistic update - roll back if the server rejects
        try {
            if (likedByMe) {
                dispatch(unlike({ id }))
                await vacationsService.unlike(id)
            } else {
                dispatch(like({ id }))
                await vacationsService.like(id)
            }
        } catch (e) {
            dispatch(likedByMe ? like({ id }) : unlike({ id }))
            showErrorToast(e)
        } finally {
            setIsToggling(false)
        }
    }

    return (
        <div className='VacationCard'>
            <div className='VacationCard-image'>
                <img src={imageUrl} alt={destination} />

                {/* admins cannot like vacations, so the button is not rendered for them */}
                {!isAdmin && (
                    <button
                        className={`VacationCard-like ${likedByMe ? 'liked' : ''}`}
                        onClick={toggleLike}
                    >
                        {likedByMe ? '♥' : '♡'} Like {likesCount}
                    </button>
                )}
                {isAdmin && (
                    <span className='VacationCard-like'>{'♥'} {likesCount}</span>
                )}

                <h3>{destination}</h3>
            </div>

            <div className='VacationCard-dates'>
                {displayDate(startDate)} - {displayDate(endDate)}
            </div>

            <p className='VacationCard-description'>{description}</p>

            <div className='VacationCard-price'>${price.toLocaleString()}</div>
        </div>
    )
}