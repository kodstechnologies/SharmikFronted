import axios from '../../utils/axios';

export interface SpecializationDto {
    _id: string;
    name: string;
    status: 'Active' | 'Inactive';
    skills: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateSpecializationPayload {
    name: string;
    status?: 'Active' | 'Inactive';
    skills?: string[];
}

export interface UpdateSpecializationPayload extends CreateSpecializationPayload {}

export const fetchSpecializations = async (status?: 'Active' | 'Inactive') => {
    const response = await axios.get('/api/specializations', {
        params: status ? { status } : undefined,
    });
    return response.data?.data?.specializations as SpecializationDto[];
};

export const createSpecialization = async (payload: CreateSpecializationPayload) => {
    const response = await axios.post('/api/specializations', payload);
    return response.data?.data?.specialization as SpecializationDto;
};

export const fetchSpecializationById = async (id: string) => {
    const response = await axios.get(`/api/specializations/${id}`);
    return response.data?.data?.specialization as SpecializationDto;
};

export const updateSpecialization = async (id: string, payload: UpdateSpecializationPayload) => {
    const response = await axios.put(`/api/specializations/${id}`, payload);
    return response.data?.data?.specialization as SpecializationDto;
};

export const deleteSpecialization = async (id: string) => {
    await axios.delete(`/api/specializations/${id}`);
};


