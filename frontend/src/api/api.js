import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// AUTH
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// PROFILE
export const updateProfile = (userId, data) => api.put(`/users/me/${userId}`, data);

// FLIGHTS
export const getCities = () => api.get('/flights/cities');
export const searchFlights = (data) => api.post('/flights/search', data);
export const getRecommended = () => api.get('/flights/recommended');

// FAVORITES
export const toggleFavorite = (userId, flightId) =>
  api.post(`/users/${userId}/favorites/${flightId}`);
export const getFavorites = (userId) => api.get(`/users/${userId}/favorites`);

// TICKETS
export const getMyTickets = (userId) => api.get(`/tickets/my/${userId}`);
export const getTicketById = (id) => api.get(`/tickets/${id}`);
export const initBooking = (data) => api.post('/tickets/init', data);
export const processPayment = (ticketId, success) =>
  api.post(`/tickets/${ticketId}/pay?success=${success}`);

// ADMIN
export const getAllUsers = () => api.get('/admin/users');
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id, requesterId) =>
  api.delete(`/admin/users/${id}?requesterId=${requesterId}`);
export const createFlight = (data, requesterId) =>
  api.post(`/admin/flights?requesterId=${requesterId}`, data);
export const deleteFlight = (id, requesterId) =>
  api.delete(`/admin/flights/${id}?requesterId=${requesterId}`);

export default api;