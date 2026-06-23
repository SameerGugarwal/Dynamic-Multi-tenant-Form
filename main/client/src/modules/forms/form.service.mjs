import http from '../../services/http.mjs';
export const formsService = { async fetchAll() { return await http.get('/forms'); } };
