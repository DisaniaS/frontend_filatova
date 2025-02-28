import { configureStore } from '@reduxjs/toolkit'
import { userReducer } from './slices/user'
import { reportsReducer } from './slices/reports';

const store = configureStore({
    reducer: {
        user: userReducer,
        reports: reportsReducer
    }
})

export default store