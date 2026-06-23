import http from '../../services/http.mjs';
export const permissionsService = { async fetchAll() { return await http.get('/permissions'); } };
