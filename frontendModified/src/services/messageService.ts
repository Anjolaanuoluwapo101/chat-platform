import api from './api';

interface Message {
  id: number;
  content: string;
  username?: string;
  created_at: string;
  media_urls?: string[];
  reply_to_message_id?: number;
  replied_message_username?: string;
  replied_message_content?: string;
  replied_message_created_at?: string;
  replied_message_media_urls?: string[];
}

interface MessageResponse {
  success: boolean;
  messages?: Message[];
  errors?: any;
}

interface SendMessageResponse {
  success: boolean;
  message?: string;
  errors?: any;
}

const messageService = {
  getMessages: async (username: string): Promise<MessageResponse> => {
    try {
      const response = await api.get(`/messages?username=${username}`, {
        cache: true,
        cacheExpiry: 180000 // 3 minutes
      } as any);
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  sendIndividualMessage: async (username: string, message: string, files: File[] = []): Promise<SendMessageResponse> => {
    try {
      const formData = new FormData();

      formData.append('username', username);
      formData.append('content', message);
      files.forEach((file) => formData.append('media[]', file));

      const response = await api.post(`/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  }
};

export default messageService;