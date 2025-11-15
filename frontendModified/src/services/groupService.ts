import api from './api';
import auth from './auth';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  is_anonymous: boolean;
  created_at: string;
  admins?: User[];
  banned_users?: User[];
   members?: GroupMember[];
}

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  media?: string[];
  created_at: string;
}

interface GroupMember {
  id: number;
  user_id: number;
  username: string;
  is_admin: boolean;
}

interface GroupInfo {
  group: Group;
  members: GroupMember[];
  messages: Message[];
}

interface GroupResponse {
  success: boolean;
  group?: Group;
  is_member?: boolean;
  groups?: Group[];
  info?: GroupInfo;
  messages?: Message[];
  errors?: any;
}

interface SendMessageResponse {
  success: boolean;
  message?: string;
  errors?: any;
}

const groupService = {
  createGroup: async (name: string, isAnonymous: boolean = true): Promise<GroupResponse> => {
    try {
      const response = await api.post('/groups', { name, is_anonymous: isAnonymous });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  joinGroup: async (groupId: number): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/join`, {
        group_id: groupId
      });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  getGroupInfo: async (groupId: number): Promise<GroupResponse> => {
    try {
      const response = await api.get(`/groups/${groupId}/info`);
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  // Get all groups for the current user
  getUserGroups: async (): Promise<GroupResponse> => {
    try {
      const response = await api.get('/groups');
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  getGroupMessages: async (groupId: number, referenceId: number | null = null, direction: string = 'before', limit: number = 50): Promise<GroupResponse> => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (referenceId) {
        params.append('reference_id', referenceId.toString());
        params.append('direction', direction);
      }
      const response = await api.get(`/groups/${groupId}?${params}`);
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  markMessagesRead: async (groupId: number, lastMessageId: number): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/markread`, { group_id: groupId, last_message_id: lastMessageId });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  getGroupMembers: async (groupId: number): Promise<GroupResponse> => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  addMember: async (groupId: number, username: string): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/members`, { username });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  removeMember: async (groupId: number, userId: number): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/members/remove`, { user_id: userId });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  sendGroupMessage: async (groupId: number, message: string, files: File[] = [], replyToMessageId: number | null = null): Promise<SendMessageResponse> => {
    try {
      const formData = new FormData();
      const user = auth.getCurrentUser();
      formData.append('username', user?.username || '');
      formData.append('content', message);
      if (replyToMessageId) {
        formData.append('reply_to_message_id', replyToMessageId.toString());
      }

      files.forEach((file) => formData.append('media[]', file));

      const response = await api.post(`/groups/${groupId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  // Admin functions should have a dedicated event subscription but not implemented yet
  removeAdmin: async (groupId: number, userId: number): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/remove-admin`, { group_id: groupId, user_id: userId });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  isAdmin: async (groupId: number, userId: number): Promise<GroupResponse> => {
    try {
      const response = await api.get(`/groups/${groupId}/is-admin?user_id=${userId}`);
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  getGroupAdmins: async (groupId: number): Promise<GroupResponse> => {
    try {
      const response = await api.get(`/groups/${groupId}/admins`);
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  updateGroupSettings: async (groupId: number, settings: any): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/update-settings`, { group_id: groupId, settings });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  deleteGroup: async (groupId: number): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/delete`, { group_id: groupId });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  banUser: async (groupId: number, userId: number): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/ban-user`, { group_id: groupId, user_id: userId });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  unbanUser: async (groupId: number, userId: number): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/unban-user`, { group_id: groupId, user_id: userId });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  promoteToAdmin: async (groupId: number, userId: number): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/promote-admin`, { group_id: groupId, user_id: userId });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  demoteAdmin: async (groupId: number, userId: number): Promise<GroupResponse> => {
    try {
      const response = await api.post(`/groups/${groupId}/demote-admin`, { group_id: groupId, user_id: userId });
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  },

  getBannedUsers: async (groupId: number): Promise<GroupResponse> => {
    try {
      const response = await api.get(`/groups/${groupId}/banned-users`);
      return response.data;
    } catch (error) {
      return { success: false, errors: error };
    }
  }
};

export default groupService;