import { api } from './client';

export interface CreateSupportRequestPayload {
  contact_support: {
    subject: string;
    message: string;
  };
}

export interface SupportRequest {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: string;
  attachment?: {
    byte_size: number;
    content_type: string;
    filename: string;
    url: string;
  };
  created_at: string;
  updated_at: string;
}

export const supportApi = {
  getSupportRequests: () => {
    return api.get<SupportRequest[]>('/contact_support');
  },
  createSupportRequest: (payload: CreateSupportRequestPayload | FormData) => {
    return api.post<SupportRequest>('/contact_support', payload);
  },
  getSupportRequestDetails: (id: number) => {
    return api.get<SupportRequest>(`/contact_support/${id}`);
  }
};
