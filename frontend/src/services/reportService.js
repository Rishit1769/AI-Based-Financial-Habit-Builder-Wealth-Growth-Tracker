import api from './api';

export const generate = (period) => api.post('/reports/generate', { period });
export const getAll = () => api.get('/reports');
export const emailReport = (reportId) => api.post(`/reports/${reportId}/email`);
