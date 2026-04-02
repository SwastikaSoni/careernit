import api from './api';

export const getAllOfficers = async () => {
  const { data } = await api.get('/officers');
  return data;
};

export const createOfficer = async (body: { name: string; email: string; password: string; phone?: string; department?: string }) => {
  const { data } = await api.post('/auth/create-officer', body);
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