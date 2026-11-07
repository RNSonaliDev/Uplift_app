import { api } from './client';

export const jobsApi = {
  getOrganizationJobs: () => api.get<any[]>('/job_posts?scope=organization'),
  getJobDetails: (id: number | string) => api.get<any>(`/job_posts/${id}`),
  createJob: (payload: any) => api.post<any>('/job_posts', payload),
  updateJob: (id: number | string, payload: any) => api.patch<any>(`/job_posts/${id}`, payload),
  deleteJob: (id: number | string) => api.delete<any>(`/job_posts/${id}`),
  closeJob: (id: number | string) => api.post<any>(`/job_posts/${id}/close`, {}),
  publishJob: (id: number | string, payload: any) => api.post<any>(`/job_posts/${id}/publish`, payload),
};

