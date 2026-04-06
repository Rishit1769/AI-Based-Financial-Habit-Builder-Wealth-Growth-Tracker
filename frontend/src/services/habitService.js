import api from './api';

export const getAll = () => api.get('/habits');
export const getStats = () => api.get('/habits/stats');
export const create = (data) => api.post('/habits', data);
export const update = (id, data) => api.put(`/habits/${id}`, data);
export const remove = (id) => api.delete(`/habits/${id}`);
export const complete = (id, data) => api.post(`/habits/${id}/complete`, data);
export const uncomplete = (id, data) => api.delete(`/habits/${id}/complete`, { data });
export const getCompletions = (id, days) => api.get(`/habits/${id}/completions?days=${days}`);
export const getStreak = (id) => api.get(`/habits/${id}/streak`);
