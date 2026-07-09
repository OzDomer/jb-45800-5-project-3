import { useContext, useEffect, type PropsWithChildren } from "react"
import { io } from "socket.io-client"
import { SocketMessages } from "vacations-socket-enums-ozdomer"
import AuthContext from "../auth/auth/AuthContext"
import useUser from "../../hooks/use-user"
import { useAppDispatch } from "../../redux/hooks"
import { externalLike, externalUnlike } from "../../redux/vacations-slice"

interface LikePayload {
    clientId: string
    vacationId: string
    userId: string
}

// listens for like/unlike events pushed by the backend through the io relay
// and updates the redux store live - no refresh needed
export default function Io(props: PropsWithChildren) {

    const { clientId } = useContext(AuthContext)!
    const user = useUser()
    const userId = user?.id

    const { children } = props

    const dispatch = useAppDispatch()

    useEffect(() => {
        const socket = io(import.meta.env.VITE_IO_SERVER_URL)
        console.log('client started listening for socket messages')

        socket.onAny((eventName: string, payload: LikePayload) => {
            // my own tab already updated optimistically - ignore the echo
            if (payload.clientId === clientId) return

            switch (eventName) {
                case SocketMessages.LIKE:
                    dispatch(externalLike({ id: payload.vacationId, isMe: payload.userId === userId }))
                    break
                case SocketMessages.UNLIKE:
                    dispatch(externalUnlike({ id: payload.vacationId, isMe: payload.userId === userId }))
                    break
            }
        })

        return () => {
            socket.disconnect()
        }
    }, [clientId, userId])

    return (
        <>
            {children}
        </>
    )
}