import api from './api';

export const loginUser = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const registerUser = async (name: string, email: string, password: string, phone?: string) => {
  const { data } = await api.post('/auth/register', { name, email, password, phone });
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
  return data;
};

export const forgotPassword = async (email: string) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data;
};

export const resetPassword = async (resetToken: string, newPassword: string) => {
  const { data } = await api.post('/auth/reset-password', { resetToken, newPassword });
  return data;
};