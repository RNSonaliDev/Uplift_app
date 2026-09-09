import { api } from './client';

export interface EmergencyContact {
  id: number;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmergencyContactPayload {
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
}

export const emergencyContactsApi = {
  getContacts: () => {
    return api.get<EmergencyContact[]>('/emergency_contacts');
  },
  
  getContact: (id: number) => {
    return api.get<EmergencyContact>(`/emergency_contacts/${id}`);
  },
  
  createContact: (payload: EmergencyContactPayload) => {
    return api.post<EmergencyContact>('/emergency_contacts', payload);
  },
  
  updateContact: (id: number, payload: EmergencyContactPayload) => {
    return api.put<EmergencyContact>(`/emergency_contacts/${id}`, payload);
  },
  
  deleteContact: (id: number) => {
    return api.delete<{ message?: string }>(`/emergency_contacts/${id}`);
  }
};
