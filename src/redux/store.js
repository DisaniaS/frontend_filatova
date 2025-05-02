import { configureStore } from '@reduxjs/toolkit'
import { userReducer } from './slices/user'
import { reportsReducer } from './slices/reports';
import inaccuracyReducer from './slices/inaccuracy';
import productsReducer from './slices/products';

const store = configureStore({
    reducer: {
        user: userReducer,
        reports: reportsReducer,
        inaccuracy: inaccuracyReducer,
        products: productsReducer
    }
})

export default store