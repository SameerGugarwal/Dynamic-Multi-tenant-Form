import http from '../../services/http.mjs';

export const CenterService = {
    /**
     * Fetch all centers
     */
    async getCenters() {
        try {
            return await http.get('/centers');
        } catch (error) {
            console.error('CenterService.getCenters Error:', error);
            throw error;
        }
    },

    /**
     * Create a new center
     * @param {Object} centerData 
     */
    async createCenter(centerData) {
        try {
            return await http.post('/centers', centerData);
        } catch (error) {
            console.error('CenterService.createCenter Error:', error);
            throw error;
        }
    },

    /**
     * Update an existing center
     */
    async updateCenter(centerId, updateData) {
        try {
            return await http.patch(`/centers/${centerId}`, updateData);
        } catch (error) {
            console.error('CenterService.updateCenter Error:', error);
            throw error;
        }
    }
};
