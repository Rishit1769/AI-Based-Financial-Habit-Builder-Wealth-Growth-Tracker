import api from './api';

export const getAll = () => api.get('/savings');
export const create = (data) => api.post('/savings', data);
export const update = (id, data) => api.put(`/savings/${id}`, data);
export const contribute = (id, amount) => api.post(`/savings/${id}/contribute`, { amount });
export const remove = (id) => api.delete(`/savings/${id}`);
