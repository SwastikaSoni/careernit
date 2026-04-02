import api from './api';

export const getAllMockTests = async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const { data } = await api.get(`/mock-tests${query}`);
    return data;
};

export const getMockTestById = async (id: string) => {
    const { data } = await api.get(`/mock-tests/${id}`);
    return data;
};

export const createMockTest = async (body: any) => {
    const { data } = await api.post('/mock-tests', body);
    return data;
};

export const updateMockTest = async (id: string, body: any) => {
    const { data } = await api.put(`/mock-tests/${id}`, body);
    return data;
};

export const deleteMockTest = async (id: string) => {
    const { data } = await api.delete(`/mock-tests/${id}`);
    return data;
};

export const startTestAttempt = async (testId: string) => {
    const { data } = await api.post(`/mock-tests/${testId}/start`);
    return data;
};

export const submitTestAttempt = async (testId: string, body: any) => {
    const { data } = await api.put(`/mock-tests/${testId}/submit`, body);
    return data;
};

export const getAttemptResult = async (attemptId: string) => {
    const { data } = await api.get(`/mock-tests/attempts/${attemptId}`);
    return data;
};

export const getMyAttempts = async () => {
    const { data } = await api.get('/mock-tests/my-attempts');
    return data;
};
