import api from './api';

export const generate = ({ month, year }) => api.post('/reports/generate', { period: `${year}-${String(month).padStart(2, '0')}` });
export const getAll = () => api.get('/reports');
export const emailReport = (reportId) => api.post(`/reports/${reportId}/email`);
