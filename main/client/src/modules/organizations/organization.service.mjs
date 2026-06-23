import http from '../../services/http.mjs';

export const OrganizationService = {
    /**
     * Fetch all organizations
     */
    async getOrganizations() {
        try {
            return await http.get('/organizations');
        } catch (error) {
            console.error('OrganizationService.getOrganizations Error:', error);
            throw error;
        }
    },

    /**
     * Create a new organization
     */
    async createOrganization(orgData) {
        try {
            return await http.post('/organizations', orgData);
        } catch (error) {
            console.error('OrganizationService.createOrganization Error:', error);
            throw error;
        }
    }
};
