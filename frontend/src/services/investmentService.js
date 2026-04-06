import api from './api';

export const getAll = () => api.get('/investments');
export const getSummary = () => api.get('/investments/summary');
export const create = (data) => api.post('/investments', data);
export const update = (id, data) => api.put(`/investments/${id}`, data);
export const remove = (id) => api.delete(`/investments/${id}`);
