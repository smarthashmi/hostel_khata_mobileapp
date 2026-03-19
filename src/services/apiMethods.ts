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

    updateProfile: (data: { name: string; phone?: string }) =>
        apiClient.put('/auth/profile', data),

    updatePassword: (data: { currentPassword: string; newPassword: string }) =>
        apiClient.post('/auth/update-password', data),

    forgotPassword: (email: string) =>
        apiClient.post('/auth/forgot-password', { email }),

    resetPassword: (data: { token: string; password: string }) =>
        apiClient.post('/auth/reset-password', data),
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

    update: (id: number, data: { name?: string; description?: string; currencyId?: number; lowPoolThreshold?: number | null }) =>
        apiClient.put(`/groups/${id}`, data),

    updateMemberRole: (groupId: number, userId: number, role: 'ADMIN' | 'MEMBER') =>
        apiClient.put(`/groups/${groupId}/members/${userId}/role`, { role }),
};

// Transaction API
export const transactionApi = {
    create: (groupId: number, data: any) =>
        apiClient.post(`/groups/${groupId}/transactions`, data),

    getHistory: (groupId: number, params?: any) =>
        apiClient.get(`/transactions/group/${groupId}`, { params }),

    getStatistics: (groupId: number) =>
        apiClient.get(`/transactions/statistics/${groupId}`),

    getRecentTransactions: (limit: number = 10) =>
        apiClient.get('/transactions/recent', { params: { limit } }),

    createExpense: (data: any) =>
        apiClient.post('/transactions/expense', data),

    createDeposit: (data: any) =>
        apiClient.post('/transactions/deposit', data),

    getById: (id: number) =>
        apiClient.get(`/transactions/${id}`),

    update: (id: number, data: any) =>
        apiClient.put(`/transactions/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/transactions/${id}`),

    addAttachment: (id: number, formData: FormData) =>
        apiClient.post(`/transactions/${id}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    deleteAttachment: (transactionId: number, attachmentId: number) =>
        apiClient.delete(`/transactions/${transactionId}/attachments/${attachmentId}`),
};

// Analytics API
export const analyticsApi = {
    getTrends: (groupId: number, params?: { startDate?: string; endDate?: string; period?: string }) =>
        apiClient.get(`/analytics/trends/${groupId}`, { params }),

    getCategories: (groupId: number, params?: { startDate?: string; endDate?: string }) =>
        apiClient.get(`/analytics/categories/${groupId}`, { params }),

    getContributions: (groupId: number, params?: { startDate?: string; endDate?: string }) =>
        apiClient.get(`/analytics/contributions/${groupId}`, { params }),
};

// Settlement API
export const settlementApi = {
    getBalances: (groupId: number) =>
        apiClient.get(`/settlements/balances/${groupId}`),

    calculate: (groupId: number) =>
        apiClient.get(`/settlements/calculate/${groupId}`),

    createRequest: (data: { groupId: number; toUserId: number; amount: number; notes?: string; proofImage?: string }) =>
        apiClient.post('/settlements/request', data),

    getRequests: (groupId: number, status?: string) =>
        apiClient.get(`/settlements/requests/${groupId}${status ? `?status=${status}` : ''}`),

    process: (settlementId: number, action: 'ACCEPT' | 'REJECT') =>
        apiClient.post(`/settlements/${settlementId}/process`, { action }),

    nudge: (groupId: number, userId: number) =>
        apiClient.post('/settlements/nudge', { groupId, userId }),

    recalculate: (groupId: number) =>
        apiClient.post(`/settlements/recalculate/${groupId}`),
};

// Activity API
export const activityApi = {
    getGroupActivity: (groupId: number, params?: { limit?: number; offset?: number }) =>
        apiClient.get(`/groups/${groupId}/activity`, { params }),
};

// Notification API
export const notificationApi = {
    getAll: () => apiClient.get('/notifications'),
    getUnreadCount: () => apiClient.get('/notifications/unread-count'),
    markRead: (id: number) => apiClient.put(`/notifications/${id}/read`),
    markAllRead: () => apiClient.put('/notifications/read-all'),
    delete: (id: number) => apiClient.delete(`/notifications/${id}`),
    registerPushToken: (token: string) => apiClient.post('/notifications/push-token', { token }),

    deleteAllRead: () => apiClient.delete('/notifications/read'),
};

// Currency API
export const currencyApi = {
    getAll: () => apiClient.get('/currencies'),

    getExchangeRate: (from: string, to: string, date?: string) =>
        apiClient.get('/currencies/rates', { params: { from, to, date } }),

    getExchangeRateHistory: (from: string, to: string, startDate?: string, endDate?: string) =>
        apiClient.get('/currencies/rates/history', { params: { from, to, startDate, endDate } }),

    convert: (amount: number, from: string, to: string, date?: string) =>
        apiClient.post('/currencies/convert', { amount, from, to, date }),

    updateRates: () =>
        apiClient.post('/currencies/update-rates'),

    seed: () =>
        apiClient.post('/currencies/seed'),
};

// Budget API
export const budgetApi = {
    create: (groupId: number, data: { amount: number; categoryId?: number; period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' }) =>
        apiClient.post(`/groups/${groupId}/budgets`, data),

    getAll: (groupId: number) =>
        apiClient.get(`/groups/${groupId}/budgets`),

    getById: (budgetId: number) =>
        apiClient.get(`/budgets/${budgetId}`),

    getStatus: (budgetId: number) =>
        apiClient.get(`/budgets/${budgetId}/status`),

    update: (budgetId: number, data: any) =>
        apiClient.put(`/budgets/${budgetId}`, data),

    delete: (budgetId: number) =>
        apiClient.delete(`/budgets/${budgetId}`),

    getAlerts: (groupId: number) =>
        apiClient.get(`/groups/${groupId}/budgets/alerts`),
};

// Category API
export const categoryApi = {
    getAll: () =>
        apiClient.get('/categories'),

    create: (data: { name: string; icon?: string; color?: string }) =>
        apiClient.post('/categories', data),

    update: (id: number, data: { name?: string; icon?: string; color?: string; isActive?: boolean }) =>
        apiClient.put(`/categories/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/categories/${id}`),
};

// Reminder API
export const reminderApi = {
    create: (data: { groupId: number; targetUserId: number; amount: number; dueDate: string; message?: string; frequency?: string }) =>
        apiClient.post('/reminders', data),

    getAll: (params?: { groupId?: number; status?: string }) =>
        apiClient.get('/reminders', { params }),

    send: (id: number) =>
        apiClient.post(`/reminders/${id}/send`),

    update: (id: number, data: any) =>
        apiClient.put(`/reminders/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/reminders/${id}`),

    processPending: () =>
        apiClient.post('/reminders/process-pending'),
};

// Inventory API
export const inventoryApi = {
    getItems: (groupId: number) =>
        apiClient.get(`/inventory/group/${groupId}`),

    create: (groupId: number, data: { name: string; stock: number; unit: string; minStock?: number; pricePerUnit?: number }) =>
        apiClient.post(`/inventory/group/${groupId}`, data),

    updateStock: (itemId: number, data: { changeAmount: number; reason?: string }) =>
        apiClient.patch(`/inventory/item/${itemId}/stock`, data),

    delete: (itemId: number) =>
        apiClient.delete(`/inventory/item/${itemId}`),

    getLogs: (groupId: number) =>
        apiClient.get(`/inventory/group/${groupId}/logs`),
};

// Ledger API
export const ledgerApi = {
    getGroupLedger: (groupId: number, params?: { startDate?: string; endDate?: string; limit?: number; offset?: number }) =>
        apiClient.get(`/ledger/${groupId}`, { params }),
};

// Statistics API
export const statisticsApi = {
    getGroupStatistics: (groupId: number) =>
        apiClient.get(`/statistics/groups/${groupId}`),
};

// Export all
// Report API
export const reportApi = {
    getTransactionCsv: (groupId: number, params?: any) =>
        apiClient.get(`/reports/groups/${groupId}/transactions/csv`, { params }),

    getBalanceCsv: (groupId: number) =>
        apiClient.get(`/reports/groups/${groupId}/balances/csv`),

    // Future PDF endpoint if implemented
    // getTransactionPdf: (groupId: number, params?: any) => ...
};

// Invitation API
export const invitationApi = {
    getPendingInvitations: () =>
        apiClient.get('/groups/invitations/pending'),

    respondToInvitation: (invitationId: number, action: 'ACCEPT' | 'REJECT') =>
        apiClient.post(`/groups/invitations/${invitationId}/respond`, { action }),
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
    budget: budgetApi,
    category: categoryApi,
    reminder: reminderApi,
    inventory: inventoryApi,
    ledger: ledgerApi,
    statistics: statisticsApi,
    report: reportApi,
    invitation: invitationApi,
};
