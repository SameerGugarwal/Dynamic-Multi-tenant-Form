import http from '../../services/http.mjs';
export const otpService = { async fetchAll() { return await http.get('/otp'); } };
