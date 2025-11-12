import api from './api';
import auth from './auth';

const groupService = {
  createGroup: async (name, isAnonymous = true) => {
    return api.post('/groups', { name, is_anonymous: isAnonymous });
  },

  joinGroup: async (groupId) => {
    return api.post(`/groups/${groupId}/join`,{
      group_id : groupId
    });
  },

  getGroupInfo: async (groupId) => {
    return api.get(`/groups/${groupId}/info`);
  },

  // Get all groups for the current user
  getUserGroups: async () => {
    return api.get('/groups');
  },

  getGroupMessages: async (groupId, referenceId = null, direction = 'before', limit = 50) => {
    const params = new URLSearchParams({ limit });
    if (referenceId) {
      params.append('reference_id', referenceId);
      params.append('direction', direction);
    }
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

  sendGroupMessage: async (groupId, message, files = [], replyToMessageId = null) => {
    const formData = new FormData();
    const user = auth.getCurrentUser();
    formData.append('username', user?.username || '');
    formData.append('content', message);
    if (replyToMessageId) {
      formData.append('reply_to_message_id', replyToMessageId);
    }

    files.forEach((file) => formData.append('media[]', file));

    return api.post(`/groups/${groupId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Admin functions should have a dedicated event subscription but not implemented yet
  removeAdmin: async (groupId, userId) => {
    return api.post(`/groups/${groupId}/remove-admin`, { group_id: groupId, user_id: userId });
  },

  isAdmin: async (groupId, userId) => {
    return api.get(`/groups/${groupId}/is-admin?user_id=${userId}`);
  },

  getGroupAdmins: async (groupId) => {
    return api.get(`/groups/${groupId}/admins`);
  },

  updateGroupSettings: async (groupId, settings) => {
    return api.post(`/groups/${groupId}/update-settings`, { group_id: groupId, settings });
  },

  deleteGroup: async (groupId) => {
    return api.post(`/groups/${groupId}/delete`, { group_id: groupId });
  },

  banUser: async (groupId, userId) => {
    return api.post(`/groups/${groupId}/ban-user`, { group_id: groupId, user_id: userId });
  },

  unbanUser: async (groupId, userId) => {
    return api.post(`/groups/${groupId}/unban-user`, { group_id: groupId, user_id: userId });
  },

  promoteToAdmin: async (groupId, userId) => {
    return api.post(`/groups/${groupId}/promote-admin`, { group_id: groupId, user_id: userId });
  },

  demoteAdmin: async (groupId, userId) => {
    return api.post(`/groups/${groupId}/demote-admin`, { group_id: groupId, user_id: userId });
  },

  getBannedUsers: async (groupId) => {
    return api.get(`/groups/${groupId}/banned-users`);
  }
};

export default groupService;
