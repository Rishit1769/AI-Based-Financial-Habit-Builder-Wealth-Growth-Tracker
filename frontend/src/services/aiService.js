import api from './api';

export const getAdvice = (message) => api.post('/ai/advice', { message });
export const getHistory = (params) => api.get('/ai/history', { params });
