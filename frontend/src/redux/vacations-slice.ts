import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type Vacation from "../models/Vacation";

interface VacationsState {
    vacations: Vacation[]
}

const initialState: VacationsState = {
    vacations: []
}

const vacationsSlice = createSlice({
    name: 'vacations',
    initialState,
    reducers: {
        populate: (state, action: PayloadAction<Vacation[]>) => {
            state.vacations = action.payload
        },
        // infinite scrolling appends the next page
        append: (state, action: PayloadAction<Vacation[]>) => {
            state.vacations.push(...action.payload)
        },
        update: (state, action: PayloadAction<Vacation>) => {
            const index = state.vacations.findIndex(vacation => vacation.id === action.payload.id)
            if (index > -1) {
                state.vacations[index] = action.payload
            }
        },
        remove: (state, action: PayloadAction<{ id: string }>) => {
            state.vacations = state.vacations.filter(vacation => vacation.id !== action.payload.id)
        },
        like: (state, action: PayloadAction<{ id: string }>) => {
            const vacation = state.vacations.find(vacation => vacation.id === action.payload.id)
            if (vacation && !vacation.likedByMe) {
                vacation.likedByMe = true
                vacation.likesCount++
            }
        },
        unlike: (state, action: PayloadAction<{ id: string }>) => {
            const vacation = state.vacations.find(vacation => vacation.id === action.payload.id)
            if (vacation && vacation.likedByMe) {
                vacation.likedByMe = false
                vacation.likesCount--
            }
        }
    }
})

export const { populate, append, update, remove, like, unlike } = vacationsSlice.actions

export default vacationsSlice.reducer