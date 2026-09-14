// src/api/chatApi.ts
import { api } from './client';

export interface ChatMessage {
  id: number;
  body: string;
  sender_id?: number;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image_url?: string;
  };
  sender_type?: string;
  sender_name?: string;
  sender_avatar?: string;
  created_at: string;
  updated_at?: string;
  assignment_id?: number;
  help_request_id?: number;
}

export const chatApi = {
  /**
   * Load chat history for a help request thread.
   */
  getMessages: async (helpRequestId: number, assignmentId: number): Promise<ChatMessage[]> => {
    const data = await api.get<any>(
      `/help_requests/${helpRequestId}/messages?assignment_id=${assignmentId}`
    );
    // API may return { messages: [...] } or plain array
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.messages)) return data.messages;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  },

  /**
   * Send a message in a help request thread.
   */
  sendMessage: async (
    helpRequestId: number,
    body: string,
    assignmentId: number,
  ): Promise<ChatMessage> => {
    console.log("@@@ assignment_id================", {
        body,
        assignment_id: assignmentId,
      })
    const data = await api.post<any>(`/help_requests/${helpRequestId}/messages`, {
      message: {
        body,
        assignment_id: assignmentId,
      },
    });
    return data;
  },
};
