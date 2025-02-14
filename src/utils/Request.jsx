import axios from 'axios'

const instance = axios.create({
    baseURL: "http://127.0.0.1:8000/api"
})

instance.interceptors.request.use((config) => {
    config.headers.setAuthorization("Bearer " + window.localStorage.getItem('token'))
    return config
})

export default instance