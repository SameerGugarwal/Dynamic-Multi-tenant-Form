import axios from 'axios';
import { TokenService } from './token.service.mjs';

// Define the base URL. Vite uses import.meta.env for environment variables                                                                                 
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3501/api/v1';

// Create a configured Axios instance                                                                                                                       
const http = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // backend  cookies use karta he refresh token ke liye 
    withCredentials: true
});
// REQUEST INTERCEPTOR                                                                                                                                      

http.interceptors.request.use(
    (config) => {
        // Before any request leaves the client check for an active token                                                                                      
        if (TokenService.isAuthenticated()) {
            const token = TokenService.getToken();
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// RESPONSE INTERCEPTOR                                                                                                     
http.interceptors.response.use(
    (response) => {
        // backend sare responses ko stand. { success, message, data },  directly return response.data                                                                                                                                                      
        return response.data;
    },
    async (error) => {
        if (error.response) {
            const { status, data } = error.response;

            // token missing
            if (status === 401) {
                console.warn('Session expired or unauthorized. Logging out...');
                TokenService.removeToken();

                // Force redirect to login screen
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }

            // 403 Forbidden wrong route permission nahi he 
            if (status === 403) {
                console.warn('Forbidden: You do not have the required role permissions.');
            }

            // backend se error msg
            const errorMessage = data?.message || 'An unexpected server error occurred.';
            return Promise.reject(new Error(errorMessage));
        }

        // network error 
        if (error.request) {
            return Promise.reject(new Error('Network error. Cannot connect to the server.'));
        }

        return Promise.reject(error);
    }
);

export default http;