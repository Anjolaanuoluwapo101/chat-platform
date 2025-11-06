import api from './api';
import auth from './auth';

const groupService = {
  createGroup: async (name, isAnonymous = true) => {
    return api.post('/groups', { name, is_anonymous: isAnonymous });
  },

  joinGroup: async (groupId) => {
    return api.post(`/groups/${groupId}/join`);
  },

  getGroupInfo: async (groupId) => {
    return api.get(`/groups/${groupId}/info`);
  },

  // Get all groups for the current user
  getUserGroups: async () => {
    return api.get('/groups');
  },

  getGroupMessages: async (groupId, beforeMessageId = null, limit = 50) => {
    const params = new URLSearchParams({ limit });
    if (beforeMessageId) params.append('before_id', beforeMessageId);
    return api.get(`/groups/${groupId}?${params}`);
  },

  markMessagesRead: async (groupId, lastMessageId) => {
    return api.post(`/groups/${groupId}/markread`, { group_id : groupId ,last_message_id: lastMessageId });
  },

  getGroupMembers: async (groupId) => {
    return api.get(`/groups/${groupId}/members`);
  },

  addMember: async (groupId, username) => {
    return api.post(`/groups/${groupId}/members`, { username });
  },

  removeMember: async (groupId, userId) => {
    return api.post(`/groups/${groupId}/members/remove`, { user_id: userId });
  },

  sendGroupMessage: async (groupId, message, files = []) => {
    const formData = new FormData();
    const user = auth.getCurrentUser();
    formData.append('username', user?.username || '');
    formData.append('content', message);

    files.forEach((file) => formData.append('media[]', file));

    return api.post(`/groups/${groupId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};

export default groupService;
