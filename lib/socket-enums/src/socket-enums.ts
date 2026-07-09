export enum SocketMessages {
    LIKE = 'LIKE',
    UNLIKE = 'UNLIKE',
    // room management: clients join while the vacations list is on screen,
    // so like updates are emitted only to clients that can actually use them
    JOIN_VACATIONS = 'JOIN_VACATIONS',
    LEAVE_VACATIONS = 'LEAVE_VACATIONS'
}

export const VACATIONS_ROOM = 'vacations-watchers'