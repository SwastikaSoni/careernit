import api from './api';

export const getMyOffers = async () => {
    const { data } = await api.get('/offers/my-offers');
    return data;
};

export const getAllOffers = async () => {
    const { data } = await api.get('/offers');
    return data;
};

export const createOffer = async (body: any) => {
    const { data } = await api.post('/offers', body);
    return data;
};

export const respondToOffer = async (id: string, body: { status: 'accepted' | 'rejected'; rejectedReason?: string }) => {
    const { data } = await api.patch(`/offers/${id}/respond`, body);
    return data;
};

export const revokeOffer = async (id: string) => {
    const { data } = await api.patch(`/offers/${id}/revoke`);
    return data;
};
