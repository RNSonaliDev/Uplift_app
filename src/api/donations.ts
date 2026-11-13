import { api, getFullUrl } from './client';

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

export interface OrganizationDonation {
  id: number;
  amount: number | string;
  message?: string;
  status?: string;
  created_at: string;
  transaction_id?: string;
  reference_number?: string;
  total_amount?: number | string;
  fee?: number | string;
  invoice_url?: string;
  [key: string]: any;
}

export interface CreateOrgDonationPayload {
  donation: {
    amount: number;
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
  createDonation: (data: CreateDonationPayload) => api.post<Donation & { client_secret?: string }>('/donations', data),
  confirmDonation: (id: string | number) => api.post<Donation>(`/donations/${id}/confirm`),
  getDashboardStats: () => api.get<DashboardStats>('/dashboard/stats'),
};

export const organizationDonationsApi = {
  getDonations: async () => {
    const list = await api.get<OrganizationDonation[]>('/organization_donations');
    if (Array.isArray(list)) {
      return list.map((item) => ({
        ...item,
        invoice_url: item.invoice_url ? getFullUrl(item.invoice_url) : item.invoice_url,
      }));
    }
    return list;
  },
  getDonation: async (id: string | number) => {
    const item = await api.get<OrganizationDonation>(`/organization_donations/${id}`);
    if (item?.invoice_url) {
      item.invoice_url = getFullUrl(item.invoice_url);
    }
    return item;
  },
  createDonation: async (data: CreateOrgDonationPayload) => {
    const res = await api.post<OrganizationDonation & { client_secret?: string }>('/organization_donations', data);
    if (res?.invoice_url) {
      res.invoice_url = getFullUrl(res.invoice_url);
    }
    return res;
  },
  confirmDonation: async (id: string | number) => {
    const res = await api.post<OrganizationDonation>(`/organization_donations/${id}/confirm`);
    if (res?.invoice_url) {
      res.invoice_url = getFullUrl(res.invoice_url);
    }
    return res;
  },
  getInvoice: async (id: string | number) => {
    const res = await api.get<{ invoice_url?: string; url?: string }>(`/organization_donations/${id}/invoice`);
    const raw = res?.invoice_url || res?.url;
    if (raw) {
      const full = getFullUrl(raw);
      return { ...res, invoice_url: full, url: full };
    }
    return res;
  },
};
