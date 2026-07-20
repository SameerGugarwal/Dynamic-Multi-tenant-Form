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
     * Fetch users belonging to the current organization
     */
    async getOrgUsers() {
        try {
            return await http.get('/users/organization');
        } catch (error) {
            console.error('UserService.getOrgUsers Error:', error);
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
    },

    /**
     * Update an existing user
     * @param {String} userId 
     * @param {Object} updateData 
     */
    async updateUser(userId, updateData) {
        try {
            // Using PATCH to match the backend route
            return await http.patch(`/users/${userId}`, updateData);
        } catch (error) {
            console.error('UserService.updateUser Error:', error);
            throw error;
        }
    },

    /**
     * Delete a user
     */
    async deleteUser(userId) {
        try {
            return await http.delete(`/users/${userId}`);
        } catch (error) {
            console.error('UserService.deleteUser Error:', error);
            throw error;
        }
    }
};
