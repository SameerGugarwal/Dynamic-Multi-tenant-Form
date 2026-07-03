import { http } from '../../services/http.mjs';
import { TokenService } from '../../services/token.service.mjs';
import { ROUTES } from '../../constants/routes.mjs';

export const AuthService = {
    async login(email, password) {
        try {
            // Our http interceptor automatically returns the JSON body from the response
            const response = await http.post('/auth/login', { email, password });
            
            // Backend returns: { success: true, data: { user, accessToken } }
            if (response.data && response.data.accessToken) {
                TokenService.setToken(response.data.accessToken);
                
                if (response.data.user) {
                    localStorage.setItem('topo_user_name', response.data.user.name || '');
                    localStorage.setItem('topo_user_profile', JSON.stringify(response.data.user));
                    if (response.data.user.centerName) {
                        localStorage.setItem('topo_center_name', response.data.user.centerName);
                    }
                    if (response.data.user.organizationName) {
                        localStorage.setItem('topo_org_name', response.data.user.organizationName);
                    }
                }
                return { success: true };
            }
            return { success: false, error: 'Invalid response from server' };
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Login failed' 
            };
        }
    },

    async register(userData) {
        try {
            const response = await http.post('/auth/register', userData);
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Registration failed' 
            };
        }
    },

    logout() {
        TokenService.removeToken();
        localStorage.clear();
        window.location.href = ROUTES.LOGIN;
    }
};
