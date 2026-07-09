import { Server } from 'socket.io'
import config from 'config'

const port = config.get<number>('app.port')

const server = new Server({
    cors: {
        origin: '*'
    }
})

// a dumb relay: every event from any client is re-broadcast to all clients
server.on('connection', socket => {
    console.log('got a new connection')
    socket.onAny((eventName: string, payload: object) => {
        console.log(`got a ${eventName} message with payload: `, payload)
        server.emit(eventName, payload)
    })
})

server.listen(port)

console.log(`io server started on ${port}`)