// src/services/api.js
import axios from 'axios';

const API_URL = 'https://uidb.onrender.com'; // Adjust this to your backend URL

const handleLogout = async () => {
  localStorage.removeItem('token');
  window.location.href = '/login'; // Redirect to login page
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      handleLogout();
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const register = async (username, password, sqlConnectionDetails) => {
  const response = await api.post('/auth/register', { username, password, sqlConnectionDetails });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      handleLogout();
    }
};

export const getUser = async () => {
  return await api.get('auth/user');
};

export default api;