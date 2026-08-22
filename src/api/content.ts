import { api } from './client';

export interface ContentResponse {
  id?: number;
  title?: string;
  slug?: string;
  content?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const contentApi = {
  getTermsOfService: () => {
    return api.get<ContentResponse>('/contents/term-condition');
  },
  getPrivacyPolicy: () => {
    return api.get<ContentResponse>('/contents/privacy-policy');
  },
  getContentBySlug: (slug: string) => {
    return api.get<ContentResponse>(`/contents/${slug}`);
  },
};

