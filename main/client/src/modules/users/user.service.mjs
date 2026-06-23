import http from '../../services/http.mjs';

export const UserService = {
    /**
     * Fetch all users
     */
    async getUsers() {
        try {
            // Un-nested by HTTP Interceptor
            return await http.get('/users');
        } catch (error) {
            console.error('UserService.getUsers Error:', error);
            throw error;
        }
    },

    /**
     * Create a new user
     * @param {Object} userData 
     */
    async createUser(userData) {
        try {
            return await http.post('/users', userData);
        } catch (error) {
            console.error('UserService.createUser Error:', error);
            throw error;
        }
    }
};
