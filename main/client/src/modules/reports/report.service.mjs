import http from '../../services/http.mjs';
export const reportsService = { async fetchAll() { return await http.get('/reports'); } };
