import './Vacations.css'
import { useEffect, useRef, useState } from 'react'
import useService from '../../../hooks/use-service'
import useUser from '../../../hooks/use-user'
import Role from '../../../models/Role'
import VacationsService, { type VacationsFilter } from '../../../services/auth-aware/VacationsService'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { append, populate } from '../../../redux/vacations-slice'
import { showErrorToast } from '../../common/show-error-toast'
import Spinner from '../../common/spinner/Spinner'
import VacationCard from '../card/VacationCard'

const PAGE_SIZE = 9

const filterLabels: { value: VacationsFilter, label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'liked', label: 'Liked by me' },
    { value: 'active', label: 'Active now' },
    { value: 'upcoming', label: 'Not started yet' },
]

interface VacationsProps {
    // the admin page reuses this list with edit/delete actions on every card
    adminActions?: boolean
}

export default function Vacations(props: VacationsProps) {

    const { adminActions } = props

    const user = useUser()
    const isAdmin = user?.role === Role.Admin

    const vacations = useAppSelector(state => state.vacationsSlice.vacations)
    const dispatch = useAppDispatch()

    // exactly one filter is active at any moment (singular filters)
    const [filter, setFilter] = useState<VacationsFilter>('all')
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [hasMore, setHasMore] = useState<boolean>(true)

    const offsetRef = useRef<number>(0)
    const isFetchingRef = useRef<boolean>(false)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const vacationsService = useService(VacationsService)

    async function loadPage(selectedFilter: VacationsFilter, reset: boolean) {
        if (isFetchingRef.current) return
        isFetchingRef.current = true

        try {
            const offset = reset ? 0 : offsetRef.current
            const page = await vacationsService.getVacations(selectedFilter, offset, PAGE_SIZE)

            offsetRef.current = offset + page.length
            // a partial page means there is nothing more to scroll for
            setHasMore(page.length === PAGE_SIZE)
            dispatch(reset ? populate(page) : append(page))
        } catch (e) {
            showErrorToast(e)
        } finally {
            isFetchingRef.current = false
            setIsLoading(false)
        }
    }

    // switching a filter resets the list and the paging offset
    useEffect(() => {
        setIsLoading(true)
        loadPage(filter, true)
    }, [filter])

    // infinite scrolling: fetch the next page when the sentinel enters the viewport
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasMore) return

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadPage(filter, false)
            }
        })

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [filter, hasMore, vacations.length])

    return (
        <div className='Vacations'>

            <div className='Vacations-filters'>
                {filterLabels
                    // admins cannot like, so the liked filter is meaningless for them
                    .filter(({ value }) => !(isAdmin && value === 'liked'))
                    .map(({ value, label }) => (
                        <button
                            key={value}
                            className={filter === value ? 'active' : ''}
                            onClick={() => setFilter(value)}
                        >
                            {label}
                        </button>
                    ))}
            </div>

            {isLoading && <Spinner />}

            {!isLoading && vacations.length === 0 && (
                <p className='Vacations-empty'>no vacations to show here...</p>
            )}

            {!isLoading && vacations.length > 0 && (
                <div className='Vacations-grid'>
                    {vacations.map(vacation => (
                        <VacationCard
                            key={vacation.id}
                            vacation={vacation}
                            isAdmin={isAdmin}
                            showAdminActions={adminActions}
                        />
                    ))}
                </div>
            )}

            {/* invisible sentinel that triggers loading the next page */}
            <div ref={sentinelRef} className='Vacations-sentinel'></div>
        </div>
    )
}