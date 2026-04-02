import api from './api';

export const getAllDepartments = async () => {
  const { data } = await api.get('/departments');
  return data;
};

export const createDepartment = async (department: { name: string; code: string; description?: string }) => {
  const { data } = await api.post('/departments', department);
  return data;
};

export const updateDepartment = async (id: string, department: { name?: string; code?: string; description?: string; isActive?: boolean }) => {
  const { data } = await api.put(`/departments/${id}`, department);
  return data;
};

export const deleteDepartment = async (id: string) => {
  const { data } = await api.delete(`/departments/${id}`);
  return data;
};