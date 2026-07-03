import { API_BASE_URL } from '../../constants/apiEndpoints.mjs';
import { TokenService } from '../../services/token.service.mjs';

export const ExcelService = {
    downloadReport: async (submissionId) => {
        const token = TokenService.getToken();
        const url = `${API_BASE_URL}/reports/download/${submissionId}?format=excel`;
        
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to download Excel');
        
        const blob = await res.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `report_${submissionId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(objectUrl);
    }
};
