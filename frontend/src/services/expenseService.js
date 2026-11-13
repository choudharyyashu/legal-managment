import { apiClient } from './apiClient';

export const expenseService = {
  async getExpenses(params = {}) {
    const res = await apiClient.get('/expenses', params);
    const expenses = Array.isArray(res?.data) ? res.data : (res?.data?.expenses || []);
    return { expenses, pagination: res?.pagination || res?.data?.pagination || {} };
  },

  async getExpenseById(id) {
    const res = await apiClient.get(`/expenses/${id}`);
    return res?.data?.expense;
  },

  async createExpense(data) {
    const res = await apiClient.post('/expenses', data);
    return res?.data?.expense;
  },

  async updateExpense(id, data) {
    const res = await apiClient.put(`/expenses/${id}`, data);
    return res?.data?.expense;
  },

  async deleteExpense(id) {
    const res = await apiClient.delete(`/expenses/${id}`);
    return res?.data;
  },
};
