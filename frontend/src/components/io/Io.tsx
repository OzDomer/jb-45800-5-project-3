import { useContext, useEffect, useState, type PropsWithChildren } from "react"
import { io, type Socket } from "socket.io-client"
import { SocketMessages } from "vacations-socket-enums-ozdomer"
import AuthContext from "../auth/auth/AuthContext"
import IoContext from "./IoContext"
import useUser from "../../hooks/use-user"
import { useAppDispatch } from "../../redux/hooks"
import { externalLike, externalUnlike } from "../../redux/vacations-slice"

interface LikePayload {
    clientId: string
    vacationId: string
    userId: string
}

// owns the socket connection, listens for like/unlike events pushed by the
// backend through the io relay and updates the redux store live.
// the socket itself is shared through IoContext so pages can join rooms.
export default function Io(props: PropsWithChildren) {

    const { clientId } = useContext(AuthContext)!
    const user = useUser()
    const userId = user?.id

    const { children } = props

    const dispatch = useAppDispatch()

    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        // forceNew: react strict-mode mounts the component twice; without it
        // both mounts share one cached socket.io Manager and the first mount's
        // teardown leaves the shared connection in a reconnect loop
        const newSocket = io(import.meta.env.VITE_IO_SERVER_URL, { forceNew: true })
        setSocket(newSocket)
        console.log('client started listening for socket messages')

        return () => {
            newSocket.disconnect()
        }
    }, [])

    useEffect(() => {
        if (!socket) return

        function handle(eventName: string, payload: LikePayload) {
            console.log(`got a ${eventName} socket message`, payload)

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
        }

        socket.onAny(handle)

        return () => {
            socket.offAny(handle)
        }
    }, [socket, clientId, userId])

    return (
        <IoContext.Provider value={socket}>
            {children}
        </IoContext.Provider>
    )
}