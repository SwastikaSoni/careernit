import api from './api';

export const getAllAnnouncements = async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const { data } = await api.get(`/announcements${query}`);
    return data;
};

export const getAnnouncementById = async (id: string) => {
    const { data } = await api.get(`/announcements/${id}`);
    return data;
};

export const createAnnouncement = async (body: any) => {
    const { data } = await api.post('/announcements', body);
    return data;
};

export const updateAnnouncement = async (id: string, body: any) => {
    const { data } = await api.put(`/announcements/${id}`, body);
    return data;
};

export const deleteAnnouncement = async (id: string) => {
    const { data } = await api.delete(`/announcements/${id}`);
    return data;
};
