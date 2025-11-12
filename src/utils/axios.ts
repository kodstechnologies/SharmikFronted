import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = (() => {
    const configured = import.meta.env.VITE_APP_API_URL?.replace(/\/+$/, '');
    if (!configured) {
        throw new Error('VITE_APP_API_URL environment variable is required');
    }
    return configured;
})();

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');

        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');

            if (!window.location.pathname.startsWith('/auth/')) {
                window.location.href = '/auth/boxed-signin';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;


