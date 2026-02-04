import apiClient from './api';

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        apiClient.post('/auth/login', { email, password }),

    register: (data: { name: string; email: string; password: string; phone?: string }) =>
        apiClient.post('/auth/register', data),

    googleAuth: (token: string) =>
        apiClient.post('/auth/google/callback', { token }),
};

// Group API
export const groupApi = {
    getAll: () => apiClient.get('/groups'),

    getById: (id: number) => apiClient.get(`/groups/${id}`),

    create: (data: { name: string; type: string; currencyId?: number }) =>
        apiClient.post('/groups', data),

    join: (code: string) => apiClient.post('/groups/join', { code }),
};

// Transaction API
export const transactionApi = {
    create: (groupId: number, data: any) =>
        apiClient.post(`/groups/${groupId}/transactions`, data),

    getHistory: (groupId: number, params?: any) =>
        apiClient.get(`/groups/${groupId}/transactions`, { params }),

    getStatistics: (groupId: number) =>
        apiClient.get(`/groups/${groupId}/statistics`),
};

// Export all
export default {
    auth: authApi,
    group: groupApi,
    transaction: transactionApi,
};
