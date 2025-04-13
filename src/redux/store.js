import { configureStore } from '@reduxjs/toolkit'
import { userReducer } from './slices/user'
import { reportsReducer } from './slices/reports';
import inaccuracyReducer from './slices/inaccuracy';

const store = configureStore({
    reducer: {
        user: userReducer,
        reports: reportsReducer,
        inaccuracy: inaccuracyReducer
    }
})

export default store