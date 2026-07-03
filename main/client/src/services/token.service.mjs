// token manager
import {ROLE_MAP} from '../constants/roles.mjs';

const TOKEN_KEY = 'topo_access_token';

export const TokenService ={
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
    removeToken: () => localStorage.removeItem(TOKEN_KEY),
    hasToken: () => !!localStorage.getItem(TOKEN_KEY),

    decodeToken() {
        const token = this.getToken();
        if (!token) return null;

        try {
            // JWTs are split into 3 parts: Header, Payload, Signature. We want the Payload (index 1).
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to decode token:', error);
            this.removeToken(); // Clear corrupted token
            return null;
        }
    },

    //Check if a valid token exists
    isAuthenticated(){
        const decoded = this.decodeToken();
        if (!decoded) return false;

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
            this.removeToken();
            return false;
        }

        return true;
    },
    //Extract the user's role for our 4-Tier RBAC routing
    getUserRole(){
        const decoded = this.decodeToken();    
        if (!decoded) return null;   
        const backendRole = decoded.role || decoded.roleId; 
        
        // If backend sends the full role object
        if (typeof backendRole === 'object' && backendRole !== null) {
            return ROLE_MAP[backendRole.name] || backendRole.name;
        }
        return ROLE_MAP[backendRole] || backendRole; 
    }
};