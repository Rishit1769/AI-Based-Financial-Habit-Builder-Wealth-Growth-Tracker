import api from './api';

export const getDashboard = () => api.get('/dashboard');
export const getMonthlyComparison = (months = 6) => api.get(`/dashboard/monthly-comparison?months=${months}`);
