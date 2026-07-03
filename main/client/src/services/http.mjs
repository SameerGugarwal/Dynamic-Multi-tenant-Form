import axios from 'axios';
// Define the base URL. Vite uses import.meta.env for environment variables
import { API_BASE_URL } from '../constants/apiEndpoints.mjs'; 
import { TokenService } from './token.service.mjs';

// custom Axios instance 
export const http = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // refresh token ke liye backend cookies use karta he 
    withCredentials: true
});
// REQUEST INTERCEPTOR  (Frontend Middleware)
// Runs BEFORE the request leaves the browser

http.interceptors.request.use(
    (config) => {
        // Before any request leaves the client check for an active token 
        if(TokenService.isAuthenticated()){
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
// Runs BEFORE your component gets the data back

http.interceptors.response.use(
    (response) => {
        // backend sare responses ko stand. { success, message, data }, directly return response.date
        return response.data;
    },
    async (error) => {
        if (error.response){
            const { status, data } = error.response;
            // 401 Unauthorized (Access Token Expired)
            if (status === 401 && !error.config._isRetry) {
                error.config._isRetry = true;
                try {
                    console.warn('Access token expired. Attempting silent refresh...');
                    // Call refresh endpoint directly with axios to avoid interceptor loops
                    const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
                        withCredentials: true // Ensures the httpOnly refresh cookie is sent
                    });
                    
                    const newAccessToken = refreshRes.data?.data?.accessToken;
                    if (newAccessToken) {
                        TokenService.setToken(newAccessToken);
                        
                        // Update the failed request's header with the new token
                        error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        
                        // Retry the original request
                        return http(error.config);
                    }
                } catch (refreshError) {
                    console.error('Refresh token expired or invalid. Forcing logout...');
                    TokenService.removeToken();
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(new Error('Session completely expired. Please log in again.'));
                }
            }

            // 403 Forbidden wrong route permission nahi he 
            if (status === 403){
                console.warn('Forbidden: You do not have the required role permissions.');
            }
            // backend se error msg
            const errorMessage = data?.message || 'An unexpected server error occurred.';
            return Promise.reject(new Error(errorMessage));
        }

        // network error
        if (error.request){
            return Promise.reject(new Error('Network error. Cannot connect to the server.'));
        }
        
        return Promise.reject(error);
    }
);

export default http;