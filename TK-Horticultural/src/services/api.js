const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'api_token';

class ApiService {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return Boolean(this.token);
  }

  async request(endpoint, options = {}) {
    const headers = {
      Accept: 'application/json',
      ...options.headers,
    };
    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      body: options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/login', { method: 'POST', body: { email, password } });
    this.setToken(data.token);
    return data;
  }

  async loginWithGoogleToken(idToken) {
    const data = await this.request('/google/login', {
      method: 'POST',
      body: { id_token: idToken },
    });
    this.setToken(data.token);
    return data;
  }

  async register(userData) {
    const data = await this.request('/register', { method: 'POST', body: userData });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    try {
      await this.request('/logout', { method: 'POST' });
    } catch {
      // Continue with local logout even if API call fails
    } finally {
      this.setToken(null);
    }
  }

  getCurrentUser() { return this.request('/me'); }
  getProfile() { return this.request('/profile'); }
  updateProfile(body) { return this.request('/profile', { method: 'PUT', body }); }
  getAdminUsers(params = {}) { return this.request(`/admin/users?${new URLSearchParams(params)}`); }
  updateAdminUser(id, body) { return this.request(`/admin/users/${id}`, { method: 'PUT', body }); }
  deleteAdminUser(id, body = {}) { return this.request(`/admin/users/${id}`, { method: 'DELETE', body }); }
  getAdminBookings(params = {}) { return this.request(`/admin/bookings?${new URLSearchParams(params)}`); }
  getAdminEnquiries(params = {}) { return this.request(`/admin/enquiries?${new URLSearchParams(params)}`); }
  getAdminDashboard() { return this.request('/admin/dashboard'); }
  getAdminServices() { return this.request('/admin/services'); }
  getGallery(params = {}) { return this.request(`/gallery?${new URLSearchParams(params)}`); }
  getAdminGallery() { return this.request('/admin/gallery'); }
  createAdminGallery(body) { return this.request('/admin/gallery', { method: 'POST', body }); }
  updateAdminGallery(id, body) { return this.request(`/admin/gallery/${id}`, { method: 'POST', body }); }
  deleteAdminGallery(id) { return this.request(`/admin/gallery/${id}`, { method: 'DELETE' }); }
  getAvailability(params = {}) { return this.request(`/slots/availability?${new URLSearchParams(params)}`); }
  getMonthlyAvailability(params = {}) { return this.request(`/slots/month?${new URLSearchParams(params)}`); }
  getUserBookings() { return this.request('/bookings'); }
  createBooking(body) { return this.request('/bookings', { method: 'POST', body }); }
  cancelBooking(id) { return this.request(`/bookings/${id}/cancel`, { method: 'POST' }); }
  createEnquiry(body) { return this.request('/enquiries', { method: 'POST', body }); }
  updateBookingStatus(id, body) { return this.request(`/admin/bookings/${id}`, { method: 'PUT', body }); }
  deleteAdminBooking(id) { return this.request(`/admin/bookings/${id}`, { method: 'DELETE' }); }
  updateEnquiryStatus(id, body) { return this.request(`/admin/enquiries/${id}`, { method: 'PUT', body }); }
  deleteAdminEnquiry(id) { return this.request(`/admin/enquiries/${id}`, { method: 'DELETE' }); }
  getAdminAvailability(date) { return this.request(`/admin/availability/${date}`); }
  updateAdminAvailability(date, body) { return this.request(`/admin/availability/${date}`, { method: 'PUT', body }); }
  updateAdminDefaultAvailability(weekday, body) { return this.request(`/admin/availability-defaults/${weekday}`, { method: 'PUT', body }); }

  uploadFile(file) {
    const body = new FormData();
    body.append('file', file);
    return this.request('/upload', { method: 'POST', body });
  }
}

export const api = new ApiService();
export default api;
