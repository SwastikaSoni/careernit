import api from './api';

export const getMyProfile = async () => {
  const { data } = await api.get('/profile/me');
  return data;
};

export const updateMyProfile = async (body: any) => {
  const { data } = await api.put('/profile/me', body);
  return data;
};

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await api.post('/profile/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getAllStudents = async (params?: Record<string, string>) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const { data } = await api.get(`/profile/students${query}`);
  return data;
};

export const getStudentById = async (id: string) => {
  const { data } = await api.get(`/profile/students/${id}`);
  return data;
};

export const verifyStudent = async (id: string, body: { status: string; remarks?: string }) => {
  const { data } = await api.put(`/profile/students/${id}/verify`, body);
  return data;
};

export const blockStudent = async (id: string, isActive: boolean) => {
  const { data } = await api.put(`/profile/students/${id}/block`, { isActive });
  return data;
};