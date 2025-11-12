import axios from '../../utils/axios';

export interface QuestionOptionDto {
    text: string;
    isCorrect: boolean;
}

export interface QuestionDto {
    text: string;
    options: QuestionOptionDto[];
}

export interface SpecializationRefDto {
    _id: string;
    name: string;
    status?: 'Active' | 'Inactive';
    skills?: string[];
}

export interface QuestionSetDto {
    _id: string;
    name: string;
    specializationIds: SpecializationRefDto[];
    questions: QuestionDto[];
    totalQuestions: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuestionSetPayload {
    name?: string;
    specializationIds: string[];
    questions: QuestionDto[];
}

export interface UpdateQuestionSetPayload extends CreateQuestionSetPayload {}

export const fetchQuestionSets = async () => {
    const response = await axios.get('/api/question-sets');
    return response.data?.data?.questionSets as QuestionSetDto[];
};

export const fetchQuestionSetById = async (id: string) => {
    const response = await axios.get(`/api/question-sets/${id}`);
    return response.data?.data?.questionSet as QuestionSetDto;
};

export const createQuestionSet = async (payload: CreateQuestionSetPayload) => {
    const response = await axios.post('/api/question-sets', payload);
    return response.data?.data?.questionSet as QuestionSetDto;
};

export const updateQuestionSet = async (id: string, payload: UpdateQuestionSetPayload) => {
    const response = await axios.put(`/api/question-sets/${id}`, payload);
    return response.data?.data?.questionSet as QuestionSetDto;
};

export const deleteQuestionSet = async (id: string) => {
    await axios.delete(`/api/question-sets/${id}`);
};


