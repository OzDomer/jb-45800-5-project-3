import { Server } from 'socket.io'
import config from 'config'
import { SocketMessages, VACATIONS_ROOM } from 'vacations-socket-enums-ozdomer'

const port = config.get<number>('app.port')

const server = new Server({
    cors: {
        origin: '*'
    }
})

// a room-aware relay: browsers join the vacations room only while the
// vacations list is on screen, and like updates are emitted to that room
// only - clients on other pages receive nothing
server.on('connection', socket => {
    console.log(`got a new connection: ${socket.id}`)

    socket.on(SocketMessages.JOIN_VACATIONS, () => {
        socket.join(VACATIONS_ROOM)
        console.log(`${socket.id} joined ${VACATIONS_ROOM} (${server.sockets.adapter.rooms.get(VACATIONS_ROOM)?.size ?? 0} watching)`)
    })

    socket.on(SocketMessages.LEAVE_VACATIONS, () => {
        socket.leave(VACATIONS_ROOM)
        console.log(`${socket.id} left ${VACATIONS_ROOM} (${server.sockets.adapter.rooms.get(VACATIONS_ROOM)?.size ?? 0} watching)`)
    })

    const relayToRoom = (eventName: string) => (payload: object) => {
        const watchers = server.sockets.adapter.rooms.get(VACATIONS_ROOM)?.size ?? 0
        console.log(`relaying ${eventName} to ${watchers} watcher(s) in ${VACATIONS_ROOM}:`, payload)
        server.to(VACATIONS_ROOM).emit(eventName, payload)
    }

    socket.on(SocketMessages.LIKE, relayToRoom(SocketMessages.LIKE))
    socket.on(SocketMessages.UNLIKE, relayToRoom(SocketMessages.UNLIKE))
})

server.listen(port)

console.log(`io server started on ${port}`)