import api from './api';

export const getAll = (params) => api.get('/income', { params });
export const getSummary = (params) => api.get('/income/summary', { params });
export const create = (data) => api.post('/income', data);
export const update = (id, data) => api.put(`/income/${id}`, data);
export const remove = (id) => api.delete(`/income/${id}`);
