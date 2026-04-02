import api from './api';

export const getAllInterviews = async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const { data } = await api.get(`/interviews${query}`);
    return data;
};

export const getInterviewById = async (id: string) => {
    const { data } = await api.get(`/interviews/${id}`);
    return data;
};

export const createInterview = async (body: any) => {
    const { data } = await api.post('/interviews', body);
    return data;
};

export const updateInterview = async (id: string, body: any) => {
    const { data } = await api.put(`/interviews/${id}`, body);
    return data;
};

export const updateInterviewRound = async (interviewId: string, roundIndex: number, body: any) => {
    const { data } = await api.put(`/interviews/${interviewId}/rounds/${roundIndex}`, body);
    return data;
};

export const addInterviewRound = async (interviewId: string, body: any) => {
    const { data } = await api.post(`/interviews/${interviewId}/rounds`, body);
    return data;
};

export const deleteInterview = async (id: string) => {
    const { data } = await api.delete(`/interviews/${id}`);
    return data;
};
