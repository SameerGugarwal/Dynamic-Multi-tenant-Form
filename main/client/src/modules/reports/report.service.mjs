import http from '../../services/http.mjs';

export const ReportService = {
    getSubmissionsByForm: async (formId, params = {}) => {
        return await http.get(`/submissions/form/${formId}`, { params });
    }
};
