import { createContext } from "react"
import type { Socket } from "socket.io-client"

// exposes the live socket so pages can join/leave rooms
// (e.g. the vacations list joins the vacations room while mounted)
const IoContext = createContext<Socket | null>(null)
export default IoContext