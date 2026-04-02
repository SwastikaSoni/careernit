import api from './api';

export const getAllDrives = async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const { data } = await api.get(`/drives${query}`);
    return data;
};

export const getDriveById = async (id: string) => {
    const { data } = await api.get(`/drives/${id}`);
    return data;
};

export const createDrive = async (body: any) => {
    const { data } = await api.post('/drives', body);
    return data;
};

export const updateDrive = async (id: string, body: any) => {
    const { data } = await api.put(`/drives/${id}`, body);
    return data;
};

export const deleteDrive = async (id: string) => {
    const { data } = await api.delete(`/drives/${id}`);
    return data;
};

export const applyToDrive = async (id: string) => {
    const { data } = await api.post(`/drives/${id}/apply`);
    return data;
};

export const getDriveApplicants = async (id: string) => {
    const { data } = await api.get(`/drives/${id}/applicants`);
    return data;
};

export const getMyApplications = async () => {
    const { data } = await api.get('/drives/my-applications');
    return data;
};

export const getAllApplications = async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const { data } = await api.get(`/applications${query}`);
    return data;
};

export const updateApplicationStatus = async (id: string, status: string) => {
    const { data } = await api.put(`/applications/${id}/status`, { status });
    return data;
};

export const withdrawApplication = async (id: string) => {
    const { data } = await api.put(`/applications/${id}/withdraw`);
    return data;
};
