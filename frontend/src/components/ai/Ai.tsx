import './Ai.css'
import { useEffect, useState } from 'react'
import type Vacation from '../../models/Vacation'
import type ItineraryResponse from '../../models/ItineraryResponse'
import useService from '../../hooks/use-service'
import VacationsService from '../../services/auth-aware/VacationsService'
import ItineraryService from '../../services/auth-aware/ItineraryService'
import SpinnerButton from '../common/spinner-button/SpinnerButton'
import TypingText from '../common/typing-text/TypingText'
import { displayDate } from '../../utils/dates'
import { showErrorToast } from '../common/show-error-toast'

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

function vacationDays(vacation: Vacation): number {
    return Math.round((new Date(vacation.endDate).getTime() - new Date(vacation.startDate).getTime()) / MILLISECONDS_PER_DAY) + 1
}

export default function Ai() {

    const [vacations, setVacations] = useState<Vacation[]>([])
    const [selectedId, setSelectedId] = useState<string>('')
    const [result, setResult] = useState<ItineraryResponse | null>(null)
    const [isGenerating, setIsGenerating] = useState<boolean>(false)

    const vacationsService = useService(VacationsService)
    const itineraryService = useService(ItineraryService)

    useEffect(() => {
        (async () => {
            try {
                // the select needs every vacation, not a page
                setVacations(await vacationsService.getVacations('all', 0, 100))
            } catch (e) {
                showErrorToast(e)
            }
        })()
    }, [])

    async function generate() {
        if (!selectedId) return

        try {
            setIsGenerating(true)
            setResult(null)
            setResult(await itineraryService.generate(selectedId))
        } catch (e) {
            showErrorToast(e)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className='Ai'>
            <h2>AI Recommendation</h2>
            <p className='Ai-subtitle'>choose a vacation and our AI travel agent will plan it day by day</p>

            <div className='Ai-controls'>
                {/* selecting an existing vacation lets the backend hand the
                    LLM the exact trip duration, so the plan fits the dates */}
                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                    <option value=''>choose a destination...</option>
                    {vacations.map(vacation => (
                        <option key={vacation.id} value={vacation.id}>
                            {vacation.destination} — {vacationDays(vacation)} days ({displayDate(vacation.startDate)} - {displayDate(vacation.endDate)})
                        </option>
                    ))}
                </select>

                <SpinnerButton
                    buttonText='Get Recommendation'
                    spinningText='planning your trip...'
                    isSpinning={isGenerating}
                    onClick={generate}
                />
            </div>

            {result && (
                <div className='Ai-result'>
                    <h3>🏝 {result.destination} — {result.days}-day itinerary</h3>
                    <div className='Ai-itinerary'>
                        <TypingText text={result.itinerary} />
                    </div>
                </div>
            )}
        </div>
    )
}