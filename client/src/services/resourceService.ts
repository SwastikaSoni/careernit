import api from './api';

export const getAllResources = async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const { data } = await api.get(`/resources${query}`);
    return data;
};

export const getResourceById = async (id: string) => {
    const { data } = await api.get(`/resources/${id}`);
    return data;
};

export const createResource = async (body: any) => {
    // Use FormData if there's a file
    if (body instanceof FormData) {
        const { data } = await api.post('/resources', body, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    }
    const { data } = await api.post('/resources', body);
    return data;
};

export const updateResource = async (id: string, body: any) => {
    if (body instanceof FormData) {
        const { data } = await api.put(`/resources/${id}`, body, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    }
    const { data } = await api.put(`/resources/${id}`, body);
    return data;
};

export const deleteResource = async (id: string) => {
    const { data } = await api.delete(`/resources/${id}`);
    return data;
};
