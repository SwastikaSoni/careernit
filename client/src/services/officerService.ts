import api from './api';

export const getAllOfficers = async () => {
  const { data } = await api.get('/officers');
  return data;
};

export const createOfficer = async (body: { name: string; email: string; password: string; phone?: string; department?: string; avatar?: File }) => {
  const formData = new FormData();
  formData.append('name', body.name);
  formData.append('email', body.email);
  formData.append('password', body.password);
  if (body.phone) formData.append('phone', body.phone);
  if (body.department) formData.append('department', body.department);
  if (body.avatar) formData.append('avatar', body.avatar);

  const { data } = await api.post('/auth/create-officer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const toggleOfficerStatus = async (id: string) => {
  const { data } = await api.put(`/officers/${id}/toggle`);
  return data;
};

export const deleteOfficer = async (id: string) => {
  const { data } = await api.delete(`/officers/${id}`);
  return data;
};