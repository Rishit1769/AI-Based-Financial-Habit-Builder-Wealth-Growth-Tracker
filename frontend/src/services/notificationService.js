import api from './api';

export const getAll = () => api.get('/notifications');
export const markRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = () => api.put('/notifications/read-all');
export const deleteOne = (id) => api.delete(`/notifications/${id}`);
export const clearRead = () => api.delete('/notifications/clear-read');
