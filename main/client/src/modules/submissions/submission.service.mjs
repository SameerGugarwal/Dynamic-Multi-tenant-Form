import http from '../../services/http.mjs';

export const SubmissionService = {
    /**
     * Fetch all submissions for the current user or org
     */
    async getSubmissions() {
        try {
            return await http.get('/submissions');
        } catch (error) {
            console.error('SubmissionService.getSubmissions Error:', error);
            throw error;
        }
    },

    /**
     * Submit a completed form payload
     * @param {string} formId 
     * @param {Object} data 
     */
    async createSubmission(formId, data) {
        try {
            return await http.post('/submissions', { formId, data });
        } catch (error) {
            console.error('SubmissionService.createSubmission Error:', error);
            throw error;
        }
    }
};
