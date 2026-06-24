import http from '../../services/http.mjs';
import { TokenService } from '../../services/token.service.mjs';
import { router } from '../../router/router.mjs';
import { ROUTES } from '../../constants/routes.mjs';

export const AuthService = {
    /**
     * Authenticate a user and establish a session
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        try {
            // Post to backend. The HTTP interceptor un-nests the response.data for us.
            const response = await http.post('/auth/login', { email, password });
            
            // Assume the unwrapped payload returns the token directly, or wrapped in a data object
            const data = response.data || response;
            
            if (data && data.accessToken) {
                // 1. Persist Token
                TokenService.setToken(data.accessToken);
                
                // 2. Fetch User Role
                const roleId = TokenService.getUserRole();
                
                // 3. Fallback to parse exact role name if token doesn't provide what we need
                // We'll also extract role directly from the user payload to be safe
                const user = data.user || {};
                const rawRoleName = typeof user.role === 'object' ? user.role.name : user.role;
                
                let normalizedRole = 'USER';
                if (rawRoleName === 'Super Admin') normalizedRole = 'SUPER_ADMIN';
                else if (rawRoleName === 'Organization Admin') normalizedRole = 'ORG_ADMIN';
                else if (rawRoleName === 'Center Admin') normalizedRole = 'CENTER_ADMIN';
                else if (rawRoleName === 'User') normalizedRole = 'USER';
                else normalizedRole = rawRoleName || 'USER';

                // Save strictly for router RBAC middleware
                localStorage.setItem('topo_user_role_name', normalizedRole);
                localStorage.setItem('topo_user_profile', JSON.stringify(user));

                // 4. Navigate dynamically
                switch (normalizedRole) {
                    case 'SUPER_ADMIN':
                        router.navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
                        break;
                    case 'CENTER_ADMIN':
                        router.navigate(ROUTES.CENTER_DASHBOARD);
                        break;
                    case 'ORG_ADMIN':
                        router.navigate(ROUTES.ORG_DASHBOARD);
                        break;
                    default:
                        router.navigate(ROUTES.USER_DASHBOARD);
                        break;
                }
                
                return data;
            } else {
                throw new Error('No access token received.');
            }
        } catch (error) {
            console.error('AuthService Login Error:', error);
            throw error;
        }
    },

    /**
     * Register a new user
     * @param {Object} userData 
     */
    async register(userData) {
        try {
            const response = await http.post('/auth/register', userData);
            const data = response.data || response;
            
            if (data && data.accessToken) {
                // Post-register login flow
                TokenService.setToken(data.accessToken);
                
                const user = data.user || {};
                const rawRoleName = typeof user.role === 'object' ? user.role.name : user.role;
                
                let normalizedRole = 'USER';
                if (rawRoleName === 'Super Admin') normalizedRole = 'SUPER_ADMIN';
                else if (rawRoleName === 'Organization Admin') normalizedRole = 'ORG_ADMIN';
                else if (rawRoleName === 'Center Admin') normalizedRole = 'CENTER_ADMIN';
                else if (rawRoleName === 'User') normalizedRole = 'USER';
                else normalizedRole = rawRoleName || 'USER';

                localStorage.setItem('topo_user_role_name', normalizedRole);
                localStorage.setItem('topo_user_profile', JSON.stringify(user));

                switch (normalizedRole) {
                    case 'SUPER_ADMIN':
                        router.navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
                        break;
                    case 'CENTER_ADMIN':
                        router.navigate(ROUTES.CENTER_DASHBOARD);
                        break;
                    case 'ORG_ADMIN':
                        router.navigate(ROUTES.ORG_DASHBOARD);
                        break;
                    default:
                        router.navigate(ROUTES.USER_DASHBOARD);
                        break;
                }
                
                return data;
            } else {
                throw new Error('Registration failed.');
            }
        } catch (error) {
            console.error('AuthService Register Error:', error);
            throw error;
        }
    },
    
    /**
     * Clear session and navigate to Landing Page
     */
    logout() {
        TokenService.removeToken();
        localStorage.removeItem('topo_user_role_name');
        localStorage.removeItem('topo_user_profile');
        router.navigate(ROUTES.HOME);
    }
};
