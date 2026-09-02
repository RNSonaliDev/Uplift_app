import { api } from './client';

export interface CategoryResponse {
  id: number;
  title: string;
  short_description: string;
  status: string;
  logo_url: string;
  updated_at: string;
  category_type?: string;
}

export interface RequestOtpPayload {
  otp: {
    identifier: string;
    purpose: 'login' | 'signup' | 'forgot_password';
  };
}

export interface RequestOtpResponse {
  message: string;
  // Add other expected fields here based on the API response
}

export interface VerifyOtpPayload {
  otp: {
    identifier: string;
    code: string;
    purpose: 'login' | 'signup' | 'forgot_password';
  };
}

export interface VerifyOtpResponse {
  message: string;
  verification_token?: string;
  user_exists?: boolean;
  token?: string; 
  access_token?: string;
  refresh_token?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    default_role?: string;
    selected_roles?: string[];
    roles?: string[];
    pending_roles?: string[];
    profile_completed?: boolean;
    basic_profile_complete?: boolean;
    registration_step?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
    profile_image_url?: string;
    parent_email?: string;
  };
}

export interface RegistrationResponse {
  message: string;
  token?: string;
  auth_token?: string;
  access_token?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    registration_step?: string;
    parent_email?: string;
  };
}

export interface RoleProfilePayload {
  role_profile: {
    selected_roles: string[];
    roles: Array<{
      role: string;
      profile: Record<string, any>;
    }>;
  };
}

export interface RoleProfileResponse {
  message: string;
  // Add other fields as necessary
}

export interface UserProfileResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  default_role: string | null;
  selected_roles: string[];
  roles: any[];
  pending_roles: string[];
  profile_completed: boolean;
  basic_profile_complete: boolean;
  registration_step: string;
  email_verified: boolean;
  phone_verified: boolean;
  profile_image_url: string | null;
  active_profile: any;
  profiles: any;
}

export const authApi = {
  requestOtp: (payload: RequestOtpPayload) => {
    return api.post<RequestOtpResponse>('/auth/otp', payload);
  },
  verifyOtp: (payload: VerifyOtpPayload) => {
    return api.post<VerifyOtpResponse>('/auth/otp/verify', payload);
  },
  resendOtp: (payload: RequestOtpPayload) => {
    return api.post<RequestOtpResponse>('/auth/otp/resend', payload);
  },
  logout: () => {
    return api.delete<{message: string}>('/auth/token');
  },
  register: (data: FormData, verificationToken: string) => {
    return api.post<RegistrationResponse>('/auth/registrations', data, {
      headers: {
        Authorization: `Bearer ${verificationToken}`,
      },
    });
  },
  saveRoleProfile: (payload: RoleProfilePayload) => {
    return api.post<RoleProfileResponse>('/role_profile', payload);
  },
  getProfile: () => {
    return api.get<UserProfileResponse>('/profile');
  },
  updateProfile: (payload: any) => {
    return api.patch<UserProfileResponse>('/role_profile', payload);
  },
  getCategories: () => {
    return api.get<CategoryResponse[]>('/categories');
  },
  setDefaultRole: (payload: { default_role: string }) => {
    return api.patch<{message: string}>('/profile/default_role', payload);
  },
  updateProfileImage: (data: FormData) => {
    return api.patch<UserProfileResponse>('/profile', data);
  },
  updateBaseProfile: (data: FormData) => {
    return api.put<UserProfileResponse>('/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  sendParentVerification: () => {
    return api.post<{message: string}>('/auth/parent_verification');
  },
  verifyParentVerification: (payload: { parent_verification: { code: string } }) => {
    return api.post<VerifyOtpResponse>('/auth/parent_verification/verify', payload);
  },
};
