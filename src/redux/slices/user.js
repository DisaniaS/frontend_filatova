import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import request from "../../utils/Request"


export const loginRequest = createAsyncThunk('auth/login', async (params) => {
    const { data } = await request.post('users/login', params)
    return data
})

export const registerRequest = createAsyncThunk('auth/register', async (params) => {
    const { data } = await request.post('users/registration', params)
    return data
})

export const checkAuthRequest = createAsyncThunk('auth/check', async () => {
    const { data } = await request.get('users/check_auth')
    return data
})

const initialState = {
    data: null,
    status: 'loading'
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.data = null
        }
    },
    extraReducers: builder => {
        builder
         .addCase(loginRequest.pending, (state) => {
            state.data = null
            state.status = 'loading'
         })
         .addCase(loginRequest.fulfilled, (state, action) => {
            state.data = action.payload
            state.status = 'loaded'
         })
         .addCase(loginRequest.rejected, (state) => {
            state.data = null
            state.status = 'error'
         })

         .addCase(checkAuthRequest.pending, (state) => {
            state.data = null
            state.status = 'loading'
         })
         .addCase(checkAuthRequest.fulfilled, (state, action) => {
            state.data = action.payload
            state.status = 'loaded'
         })
         .addCase(checkAuthRequest.rejected, (state) => {
            state.data = null
            state.status = 'error'
         })   

         .addCase(registerRequest.pending, (state) => {
            state.data = null
            state.status = 'loading'
         })
         .addCase(registerRequest.fulfilled, (state, action) => {
            state.data = action.payload
            state.status = 'loaded'
         })
         .addCase(registerRequest.rejected, (state) => {
            state.data = null
            state.status = 'error'
         })
        }
})

export const selectIsAuth = (state) => Boolean(state.user.data)

export const userReducer = userSlice.reducer

export const { logout } = userSlice.actions