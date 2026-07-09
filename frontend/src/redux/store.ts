import { configureStore } from "@reduxjs/toolkit";
import vacationsSlice from './vacations-slice'

const store = configureStore({
    reducer: {
        vacationsSlice
    }
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch