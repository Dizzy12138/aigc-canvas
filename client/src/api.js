import axios from 'axios';

/**
 * Create a configured Axios instance. If a JWT token is present in localStorage
 * it will be attached to the Authorization header automatically. Endpoints
 * starting with /api will be proxied to the backend via the Vite dev server
 * during development.
 */
const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;