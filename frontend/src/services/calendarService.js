import { apiClient } from './apiClient';

export const calendarService = {
  async getEvents(params = {}) {
    const res = await apiClient.get('/calendar/events', params);
    return res?.data?.events || [];
  },

  async createEvent(data) {
    const res = await apiClient.post('/calendar/events', data);
    return res?.data?.event;
  },

  async updateEvent(id, data) {
    const res = await apiClient.put(`/calendar/events/${id}`, data);
    return res?.data?.event;
  },

  async deleteEvent(id) {
    const res = await apiClient.delete(`/calendar/events/${id}`);
    return res?.data;
  },
};

