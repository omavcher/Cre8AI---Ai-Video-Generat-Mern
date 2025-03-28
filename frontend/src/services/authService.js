import axios from 'axios';
import { BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const googleAuth = async (credential) => {
  const response = await api.post('/users/google-auth', { tokenId: credential });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
}; 

export const getSavedProjects = async () => {
  const response = await api.get('/video/saved-projects');
  return response.data;
}

// Add this to your authService.js
export const deleteProject = async (projectId) => {
  const response = await api.delete(`/video/saved-projects/${projectId}`);
  return response.data;
};