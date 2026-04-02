import api from './api';

export const getAllCompanies = async (params?: Record<string, string>) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const { data } = await api.get(`/companies${query}`);
  return data;
};

export const getCompanyById = async (id: string) => {
  const { data } = await api.get(`/companies/${id}`);
  return data;
};

export const createCompany = async (body: any) => {
  const { data } = await api.post('/companies', body);
  return data;
};

export const updateCompany = async (id: string, body: any) => {
  const { data } = await api.put(`/companies/${id}`, body);
  return data;
};

export const deleteCompany = async (id: string) => {
  const { data } = await api.delete(`/companies/${id}`);
  return data;
};