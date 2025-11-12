import axios from '../../utils/axios';

export interface LoginRequestPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: string;
        };
    };
    meta?: unknown;
}

export const login = async ({ email, password }: LoginRequestPayload): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>('/api/auth/login', {
        email,
        password,
    });

    return response.data;
};

 
