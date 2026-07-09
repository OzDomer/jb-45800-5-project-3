import './Assistant.css'
import { useState, type FormEvent } from 'react'
import useService from '../../hooks/use-service'
import AssistantService from '../../services/auth-aware/AssistantService'
import SpinnerButton from '../common/spinner-button/SpinnerButton'
import TypingText from '../common/typing-text/TypingText'
import { showErrorToast } from '../common/show-error-toast'

export default function Assistant() {

    const [prompt, setPrompt] = useState<string>('')
    const [answer, setAnswer] = useState<string>('')
    const [isAsking, setIsAsking] = useState<boolean>(false)

    const assistantService = useService(AssistantService)

    async function ask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const trimmed = prompt.trim()
        if (!trimmed || isAsking) return

        try {
            setIsAsking(true)
            setAnswer('')
            const response = await assistantService.ask(trimmed)
            setAnswer(response.answer)
        } catch (e) {
            showErrorToast(e)
        } finally {
            setIsAsking(false)
        }
    }

    return (
        <div className='Assistant'>
            <h2>Ask me anything about our vacations</h2>
            <p className='Assistant-subtitle'>
                for example: how many vacations are active right now? what is the average price?
            </p>

            <form className='Assistant-form' onSubmit={ask}>
                <textarea
                    placeholder='your question...'
                    rows={3}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    disabled={isAsking}
                />

                <SpinnerButton
                    buttonText='Ask'
                    spinningText='asking the assistant...'
                    isSpinning={isAsking}
                />
            </form>

            {answer && (
                <div className='Assistant-answer'>
                    <TypingText text={answer} />
                </div>
            )}
        </div>
    )
}