import './VacationCard.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type Vacation from '../../../models/Vacation'
import { displayDate } from '../../../utils/dates'
import useService from '../../../hooks/use-service'
import VacationsService from '../../../services/auth-aware/VacationsService'
import { useAppDispatch } from '../../../redux/hooks'
import { like, remove, unlike } from '../../../redux/vacations-slice'
import { showErrorToast } from '../../common/show-error-toast'

interface VacationCardProps {
    vacation: Vacation,
    isAdmin: boolean,
    // edit/delete buttons - rendered on the admin page only
    showAdminActions?: boolean
}
export default function VacationCard(props: VacationCardProps) {

    const { vacation, isAdmin, showAdminActions } = props
    const { id, destination, description, startDate, endDate, price, imageUrl, likesCount, likedByMe } = vacation

    const [isToggling, setIsToggling] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    const vacationsService = useService(VacationsService)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    function editMe() {
        navigate(`/admin/edit/${id}`)
    }

    async function deleteMe() {
        // never delete without the admin confirming first
        if (!confirm(`are you sure you want to delete the vacation to ${destination}?`)) return

        try {
            setIsDeleting(true)
            await vacationsService.deleteVacation(id)
            dispatch(remove({ id }))
        } catch (e) {
            showErrorToast(e)
        } finally {
            setIsDeleting(false)
        }
    }

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

                {showAdminActions && (
                    <div className='VacationCard-actions'>
                        <button onClick={editMe}>✎ Edit</button>
                        <button onClick={deleteMe} disabled={isDeleting}>
                            {isDeleting ? 'deleting...' : '🗑 Delete'}
                        </button>
                    </div>
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