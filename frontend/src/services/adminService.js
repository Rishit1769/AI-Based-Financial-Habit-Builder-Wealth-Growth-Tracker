import api from './api';

export const getUsers = (params) => api.get('/admin/users', { params });
export const toggleUser = (userId) => api.put(`/admin/users/${userId}/toggle`);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const getStats = () => api.get('/admin/stats');
export const getActivity = () => api.get('/admin/activity');
