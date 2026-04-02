import api from './api';

export const getAllQuestions = async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const { data } = await api.get(`/questions${query}`);
    return data;
};

export const getQuestionById = async (id: string) => {
    const { data } = await api.get(`/questions/${id}`);
    return data;
};

export const createQuestion = async (body: any) => {
    const { data } = await api.post('/questions', body);
    return data;
};

export const updateQuestion = async (id: string, body: any) => {
    const { data } = await api.put(`/questions/${id}`, body);
    return data;
};

export const deleteQuestion = async (id: string) => {
    const { data } = await api.delete(`/questions/${id}`);
    return data;
};
