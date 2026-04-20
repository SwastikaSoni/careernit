import api from './api';

export const sendContactMessage = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const response = await api.post('/contact', data);
  return response.data;
};

export const getContactInfo = async () => {
  const { data } = await api.get('/contact/info');
  return data;
};
