
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3501/api/v1';

export const API_ENDPOINTS = {
    AUTH: { 
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout'
    },
    USERS: '/users',
    CENTERS: '/centers',
    ORGANIZATIONS: '/organizations',
    FORMS: '/forms',
    SUBMISSIONS: '/submissions',
    DASHBOARD: '/dashboard/stats'
};
