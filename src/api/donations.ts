import { api } from './client';

export interface Donation {
  id: number;
  amount: number | string;
  recipient_type: string;
  message?: string;
  status?: string;
  created_at: string;
  transaction_id?: string;
  reference_number?: string;
}

export interface CreateDonationPayload {
  donation: {
    amount: number;
    recipient_type: string;
    message?: string;
  };
}

export interface DashboardStats {
  donations_total: number;
  amount_donated: number;
  donations_pending: number;
  last_donation_at: string | null;
  donations_volunteers: number;
  donations_beneficiaries: number;
  donations_general: number;
  amount_donated_volunteers: number;
  amount_donated_beneficiaries: number;
  amount_donated_general: number;
  role: string;
}

export const donationsApi = {
  getDonations: () => api.get<Donation[]>('/donations'),
  getDonation: (id: string | number) => api.get<Donation>(`/donations/${id}`),
  createDonation: (data: CreateDonationPayload) => api.post<Donation>('/donations', data),
  getDashboardStats: (role: string = 'sponsor') => api.get<DashboardStats>(`/dashboard/stats?role=${role}`),
};
