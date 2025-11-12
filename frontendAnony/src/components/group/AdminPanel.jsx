import React, { useState, useEffect } from 'react';
import groupService from '../../services/groupService';
import { CloseIcon } from './AdminIcons';

const AdminPanel = ({ 
  groupId, 
  admins, 
  members, 
  bannedUsers, 
  onAdminDataRefresh,
  initialTab = 'members',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handlePromoteToAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to admin?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.promoteToAdmin(groupId, userId);
      if (response.data.success) {
        await onAdminDataRefresh();
        alert("User promoted to admin successfully!");
      } else {
        alert("Failed to promote user to admin.");
      }
    } catch (err) {
      console.error('Failed to promote user to admin', err);
      alert("Error promoting user to admin");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoteAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to demote this admin?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.demoteAdmin(groupId, userId);
      if (response.data.success) {
        await onAdminDataRefresh();
        alert("Admin demoted successfully!");
      } else {
        alert("Failed to demote admin.");
      }
    } catch (err) {
      console.error('Failed to demote admin', err);
      alert("Error demoting admin");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.banUser(groupId, userId);
      if (response.data.success) {
        await onAdminDataRefresh();
        alert("User banned successfully!");
      } else {
        alert("Failed to ban user.");
      }
    } catch (err) {
      console.error('Failed to ban user', err);
      alert("Error banning user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unban this user?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.unbanUser(groupId, userId);
      if (response.data.success) {
        await onAdminDataRefresh();
        alert("User unbanned successfully!");
      } else {
        alert("Failed to unban user.");
      }
    } catch (err) {
      console.error('Failed to unban user', err);
      alert("Error unbanning user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.deleteGroup(groupId);
      if (response.data.success) {
        alert("Group deleted successfully!");
        // Redirect to groups page
        window.location.href = '/groups';
      } else {
        alert("Failed to delete group.");
      }
    } catch (err) {
      console.error('Failed to delete group', err);
      alert("Error deleting group");
    } finally {
      setLoading(false);
    }
  };

  const renderMembersTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Admins</h3>
        {admins.length > 0 ? (
          <ul className="space-y-2">
            {admins.map(admin => (
              <li key={admin.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{admin.username}</span>
                <div className="space-x-2">
                  <button 
                    onClick={() => handleDemoteAdmin(admin.id)}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    Demote
                  </button>
                  <button 
                    onClick={() => handleBanUser(admin.id)}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Ban
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No admins found</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Members</h3>
        {members.length > 0 ? (
          <ul className="space-y-2">
            {members
              .filter(member => !admins.some(admin => admin.id === member.id))
              .map(member => (
                <li key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{member.username}</span>
                  <div className="space-x-2">
                    <button 
                      onClick={() => handlePromoteToAdmin(member.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      Promote
                    </button>
                    <button 
                      onClick={() => handleBanUser(member.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Ban
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500">No members found</p>
        )}
      </div>
    </div>
  );

  const renderBannedUsersTab = () => (
    <div>
      <h3 className="text-lg font-semibold mb-2">Banned Users</h3>
      {bannedUsers.length > 0 ? (
        <ul className="space-y-2">
          {bannedUsers.map(user => (
            <li key={user.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{user.username}</span>
              <button 
                onClick={() => handleUnbanUser(user.id)}
                disabled={loading}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Unban
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No banned users found</p>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 rounded">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
        <p className="text-red-700 mb-4">Deleting a group is permanent and cannot be undone.</p>
        <button 
          onClick={handleDeleteGroup}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Delete Group
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('banned')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'banned'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Banned Users
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'banned' && renderBannedUsersTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;