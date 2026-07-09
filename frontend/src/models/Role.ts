// vite's erasableSyntaxOnly forbids TS enums, so Role is a const object
// that doubles as a type - used exactly like an enum
const Role = {
    User: 'user',
    Admin: 'admin'
} as const

type Role = typeof Role[keyof typeof Role]

export default Role