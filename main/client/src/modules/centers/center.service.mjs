import { http } from '../../services/http.mjs';

export const CenterService = {
    /**
     * Fetch all centers from the API
     */
    getCenters: async () => {
        try {
            const response = await http.get('/centers');
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch centers:', error);
            throw error;
        }
    },

    /**
     * Create a new center
     * @param {Object} payload - { name, contactEmail, location }
     */
    createCenter: async (payload) => {
        try {
            const response = await http.post('/centers', payload);
            return response.data;
        } catch (error) {
            console.error('Failed to create center:', error);
            throw error;
        }
    },

    /**
     * Update an existing center (e.g., status toggle)
     * @param {String} id - Center ID
     * @param {Object} payload - Data to update (e.g., { isActive: false })
     */
    updateCenter: async (id, payload) => {
        try {
            const response = await http.patch(`/centers/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Failed to update center ${id}:`, error);
            throw error;
        }
    },

    /**
     * Fetch settings for the Center Admin's own center
     */
    getSettings: async () => {
        try {
            const response = await http.get('/centers/settings/profile');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch center settings:', error);
            throw error;
        }
    },

    /**
     * Update settings for the Center Admin's own center
     */
    updateSettings: async (payload) => {
        try {
            const response = await http.patch('/centers/settings/profile', payload);
            return response.data;
        } catch (error) {
            console.error('Failed to update center settings:', error);
            throw error;
        }
    }
};
