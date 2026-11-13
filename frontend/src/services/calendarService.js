import { apiClient } from './apiClient';

export const calendarService = {
  async getEvents(params = {}) {
    const res = await apiClient.get('/calendar/events', params);
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.events)) return res.data.events;
    return [];
  },

  async getEventById(id) {
    const res = await apiClient.get(`/calendar/events/${id}`);
    return res?.data?.event || res?.data;
  },

  async createEvent(data) {
    const res = await apiClient.post('/calendar/events', data);
    return res?.data?.event || res?.data;
  },

  async updateEvent(id, data) {
    const res = await apiClient.put(`/calendar/events/${id}`, data);
    return res?.data?.event || res?.data;
  },

  async deleteEvent(id) {
    const res = await apiClient.delete(`/calendar/events/${id}`);
    return res?.data;
  },
};
