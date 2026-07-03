import { API_BASE_URL } from '../../constants/apiEndpoints.mjs';
import { TokenService } from '../../services/token.service.mjs';

export const PdfService = {
    downloadReport: async (submissionId) => {
        const token = TokenService.getToken();
        const url = `${API_BASE_URL}/reports/download/${submissionId}?format=pdf`;
        
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to download PDF');
        
        const blob = await res.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `report_${submissionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(objectUrl);
    }
};
