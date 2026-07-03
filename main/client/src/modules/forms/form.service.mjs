import http from '../../services/http.mjs';

export const FormService = {
    // Fetch all forms (or master forms)
    async getForms() {
        try {
            // Using your custom endpoint
            return await http.get('/forms/master');
        } catch (error) {
            console.error('FormService.getForms Error:', error);
            throw error;
        }
    },

    // Fetch localized forms belonging to the user's organization
    async getOrgForms() {
        try {
            return await http.get('/forms/organization');
        } catch (error) {
            console.error('FormService.getOrgForms Error:', error);
            throw error;
        }
    },

    // Fetch master templates that were assigned to the current org
    async getAssignedForms() {
        try {
            return await http.get('/forms/assigned');
        } catch (error) {
            console.error('FormService.getAssignedForms Error:', error);
            throw error;
        }
    },

    // Assign a form to an organization (Center Admin)
    async assignForm(masterFormId, targetOrgId) {
        try {
            return await http.post('/forms/assign', { masterFormId, targetOrgId });
        } catch (error) {
            console.error('FormService.assignForm Error:', error);
            throw error;
        }
    },

    // Clone a master form
    async cloneForm(masterFormId, targetOrgId = null) {
        try {
            return await http.post('/forms/clone', { masterFormId, targetOrgId });
        } catch (error) {
            console.error('FormService.cloneForm Error:', error);
            throw error;
        }
    },

    // Fetch a single form by ID (for Builder/Preview)
    async getFormById(formId) {
        try {
            return await http.get(`/forms/${formId}`);
        } catch (error) {
            console.error('FormService.getFormById Error:', error);
            throw error;
        }
    },

    // Create a new form
    async createForm(formData) {
        try {
            return await http.post('/forms', formData);
        } catch (error) {
            console.error('FormService.createForm Error:', error);
            throw error;
        }
    },

    // Update an existing form
    async updateForm(formId, updateData) {
        try {
            // You were using PUT, so I've updated this to PUT to match your code
            return await http.put(`/forms/${formId}`, updateData);
        } catch (error) {
            console.error(`FormService.updateForm Error (${formId}):`, error);
            throw error;
        }
    },

    // Delete a form
    async deleteForm(formId) {
        try {
            return await http.delete(`/forms/${formId}`);
        } catch (error) {
            console.error(`FormService.deleteForm Error (${formId}):`, error);
            throw error;
        }
    }
};
