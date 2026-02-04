import apiClient from './api';

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        apiClient.post('/auth/login', { email, password }),

    register: (data: { name: string; email: string; password: string; phone?: string }) =>
        apiClient.post('/auth/register', data),

    googleAuth: (token: string) =>
        apiClient.post('/auth/google/callback', { token }),

    getMe: () => apiClient.get('/auth/me'),
};

// Group API
export const groupApi = {
    getAll: () => apiClient.get('/groups'),

    getById: (id: number) => apiClient.get(`/groups/${id}`),

    create: (data: { name: string; type: string; currencyId?: number }) =>
        apiClient.post('/groups', data),

    join: (code: string) => apiClient.post('/groups/join', { code }),

    addVirtualMember: (groupId: number, data: { name: string; email?: string }) =>
        apiClient.post(`/groups/${groupId}/virtual-members`, data),
};

// Transaction API
export const transactionApi = {
    create: (groupId: number, data: any) =>
        apiClient.post(`/groups/${groupId}/transactions`, data),

    getHistory: (groupId: number, params?: any) =>
        apiClient.get(`/transactions/group/${groupId}`, { params }),

    getStatistics: (groupId: number) =>
        apiClient.get(`/transactions/statistics/${groupId}`),

    createExpense: (data: any) =>
        apiClient.post('/transactions/expense', data),

    createDeposit: (data: any) =>
        apiClient.post('/transactions/deposit', data),
};

// Analytics API
export const analyticsApi = {
    getTrends: (groupId: number) =>
        apiClient.get(`/analytics/trends/${groupId}`),

    getCategories: (groupId: number) =>
        apiClient.get(`/analytics/categories/${groupId}`),

    getContributions: (groupId: number) =>
        apiClient.get(`/analytics/contributions/${groupId}`),
};

// Settlement API
export const settlementApi = {
    getBalances: (groupId: number) =>
        apiClient.get(`/settlements/balances/${groupId}`),

    calculate: (groupId: number) =>
        apiClient.get(`/settlements/calculate/${groupId}`),
};

// Activity API
// Activity API - Using transactions as activity
export const activityApi = {
    getGroupActivity: (groupId: number) =>
        apiClient.get(`/transactions/group/${groupId}?limit=20`), // Reusing transaction history
};

// Notification API
export const notificationApi = {
    getAll: () => apiClient.get('/notifications'),
    getUnreadCount: () => apiClient.get('/notifications/unread-count'),
    markRead: (id: number) => apiClient.put(`/notifications/${id}/read`),
    markAllRead: () => apiClient.put('/notifications/read-all'),
    delete: (id: number) => apiClient.delete(`/notifications/${id}`),
    registerPushToken: (token: string) => apiClient.post('/notifications/push-token', { token }),
};

// Currency API
export const currencyApi = {
    getAll: () => apiClient.get('/currencies'),
};

// Export all
export default {
    auth: authApi,
    group: groupApi,
    transaction: transactionApi,
    analytics: analyticsApi,
    settlement: settlementApi,
    activity: activityApi,
    notification: notificationApi,
    currency: currencyApi,
};
