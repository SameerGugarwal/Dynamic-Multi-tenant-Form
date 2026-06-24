// src/constants/routes.mjs

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    
    // Super Admin Tier
    SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
    SUPER_ADMIN_CENTERS: '/super-admin/centers',
    SUPER_ADMIN_ORGS: '/super-admin/organizations',
    SUPER_ADMIN_FORMS: '/super-admin/forms',
    
    // Center Admin Tier
    CENTER_DASHBOARD: '/center/dashboard',
    CENTER_ORGS: '/center/organizations',
    CENTER_USERS: '/center/users',
    CENTER_REPORTS: '/center/reports',
    CENTER_SETTINGS: '/center/settings',
    
    // Org Admin Tier
    ORG_DASHBOARD: '/organization/dashboard',
    ORG_USERS: '/organization/users',
    ORG_FORMS: '/organization/forms',
    
    // Standard User Tier
    USER_DASHBOARD: '/user/dashboard',
    USER_FORMS: '/user/forms',
    USER_PROFILE: '/user/profile',
    
    UNAUTHORIZED: '/unauthorized'
};