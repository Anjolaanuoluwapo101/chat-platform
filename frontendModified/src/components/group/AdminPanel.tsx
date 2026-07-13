import { useState, useEffect } from 'react';
import groupService from '../../services/groupService';
import { CloseIcon } from './AdminIcons';
import { motion } from 'framer-motion';

interface User {
  id: number;
  username: string;
}

interface AdminPanelProps {
  groupId: number;
  admins: User[];
  members: User[];
  bannedUsers: User[];
  onAdminDataRefresh: () => Promise<void>;
  initialTab?: string;
  onClose: () => void;
}

const AdminPanel = ({ 
  groupId, 
  admins, 
  members, 
  bannedUsers, 
  onAdminDataRefresh,
  initialTab = 'members',
  onClose
}: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');

  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleAddMember = async () => {
    if (!newMemberUsername.trim()) {
      alert('Please enter a username');
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.addMember(groupId, newMemberUsername);
      if (response.success) {
        setNewMemberUsername('');
        await onAdminDataRefresh();
        alert("Member added successfully!");
      } else {
        alert(response.errors || "Failed to add member.");
      }
    } catch (err) {
      console.error('Failed to add member', err);
      alert("Error adding member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.removeMember(groupId, userId);
      if (response.success) {
        await onAdminDataRefresh();
        alert("Member removed successfully!");
      } else {
        alert("Failed to remove member.");
      }
    } catch (err) {
      console.error('Failed to remove member', err);
      alert("Error removing member");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId: number) => {
    if (!window.confirm('Are you sure you want to promote this user to admin?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.promoteToAdmin(groupId, userId);
      if (response.success) {
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

  const handleDemoteAdmin = async (userId: number) => {
    if (!window.confirm('Are you sure you want to demote this admin?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.demoteAdmin(groupId, userId);
      if (response.success) {
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

  const handleBanUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to ban this user?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.banUser(groupId, userId);
      if (response.success) {
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

  const handleUnbanUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to unban this user?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await groupService.unbanUser(groupId, userId);
      if (response.success) {
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
      if (response.success) {
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
        <h3 className="text-[10px] font-bold uppercase tracking-wide text-lk-t3 dark:text-dk-t3 mb-2">Add Member</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter username"
            value={newMemberUsername}
            onChange={(e) => setNewMemberUsername(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-lk-s3 dark:bg-dk-s3 text-lk-t1 dark:text-dk-t1 border-2 border-lk-border dark:border-dk-border rounded-[10px] focus:outline-none focus:border-lk-accent dark:focus:border-dk-accent focus:bg-lk-accent-pale dark:focus:bg-dk-accent-pale transition-colors"
            disabled={loading}
          />
          <button
            onClick={handleAddMember}
            disabled={loading || !newMemberUsername.trim()}
            className="px-5 py-2 bg-lk-accent dark:bg-dk-accent text-white font-medium rounded-full hover:bg-lk-accent2 dark:hover:bg-dk-accent2 transition-colors duration-300 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wide text-lk-t3 dark:text-dk-t3 mb-2">Admins</h3>
        {admins.length > 0 ? (
          <ul className="space-y-2">
            {admins.map(admin => (
              <li key={admin.id} className="flex justify-between items-center p-3 bg-lk-s2 dark:bg-dk-s2 rounded-[10px] border border-lk-border2 dark:border-dk-border2">
                <span className="flex items-center gap-2 text-lk-t1 dark:text-dk-t1">
                  <span className="w-2 h-2 rounded-full bg-lk-accent dark:bg-dk-accent" />
                  {admin.username}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDemoteAdmin(admin.id)}
                    disabled={loading}
                    className="px-3 py-1 text-xs font-medium bg-lk-s3 dark:bg-dk-s3 text-lk-t2 dark:text-dk-t2 rounded-full hover:bg-lk-border dark:hover:bg-dk-border transition-colors duration-300 disabled:opacity-50"
                  >
                    Demote
                  </button>
                  <button
                    onClick={() => handleBanUser(admin.id)}
                    disabled={loading}
                    className="px-3 py-1 text-xs font-medium bg-lk-danger-pale dark:bg-dk-danger-pale text-lk-danger dark:text-dk-danger rounded-full hover:opacity-80 transition-opacity duration-300 disabled:opacity-50"
                  >
                    Ban
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lk-t3 dark:text-dk-t3 text-sm">No admins found</p>
        )}
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wide text-lk-t3 dark:text-dk-t3 mb-2">Members</h3>
        {members.length > 0 ? (
          <ul className="space-y-2">
            {members
              .filter(member => !admins.some(admin => admin.id === member.id))
              .map(member => (
                <li key={member.id} className="flex justify-between items-center p-3 bg-lk-s2 dark:bg-dk-s2 rounded-[10px] border border-lk-border2 dark:border-dk-border2">
                  <span className="flex items-center gap-2 text-lk-t1 dark:text-dk-t1">
                    <span className="w-2 h-2 rounded-full bg-lk-t3 dark:bg-dk-t3" />
                    {member.username}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePromoteToAdmin(member.id)}
                      disabled={loading}
                      className="px-3 py-1 text-xs font-medium bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent rounded-full hover:opacity-80 transition-opacity duration-300 disabled:opacity-50"
                    >
                      Promote
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={loading}
                      className="px-3 py-1 text-xs font-medium bg-lk-s3 dark:bg-dk-s3 text-lk-t2 dark:text-dk-t2 rounded-full hover:bg-lk-border dark:hover:bg-dk-border transition-colors duration-300 disabled:opacity-50"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleBanUser(member.id)}
                      disabled={loading}
                      className="px-3 py-1 text-xs font-medium bg-lk-danger-pale dark:bg-dk-danger-pale text-lk-danger dark:text-dk-danger rounded-full hover:opacity-80 transition-opacity duration-300 disabled:opacity-50"
                    >
                      Ban
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-lk-t3 dark:text-dk-t3 text-sm">No members found</p>
        )}
      </div>
    </div>
  );

  const renderBannedUsersTab = () => (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-wide text-lk-t3 dark:text-dk-t3 mb-2">Banned Users</h3>
      {bannedUsers.length > 0 ? (
        <ul className="space-y-2">
          {bannedUsers.map(user => (
            <li key={user.id} className="flex justify-between items-center p-3 bg-lk-s2 dark:bg-dk-s2 rounded-[10px] border border-lk-border2 dark:border-dk-border2">
              <span className="flex items-center gap-2 text-lk-t1 dark:text-dk-t1">
                <span className="w-2 h-2 rounded-full bg-lk-danger dark:bg-dk-danger" />
                {user.username}
              </span>
              <button
                onClick={() => handleUnbanUser(user.id)}
                disabled={loading}
                className="px-3 py-1 text-xs font-medium bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent rounded-full hover:opacity-80 transition-opacity duration-300 disabled:opacity-50"
              >
                Unban
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lk-t3 dark:text-dk-t3 text-sm">No banned users found</p>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="p-4 bg-lk-danger-pale dark:bg-dk-danger-pale rounded-[10px] border border-lk-danger/30 dark:border-dk-danger/30">
        <h3 className="text-sm font-display font-bold text-lk-danger dark:text-dk-danger mb-2">Danger Zone</h3>
        <p className="text-sm text-lk-t2 dark:text-dk-t2 mb-4">Deleting a group is permanent and cannot be undone.</p>
        <button
          onClick={handleDeleteGroup}
          disabled={loading}
          className="px-5 py-2.5 bg-lk-danger dark:bg-dk-danger text-white font-medium rounded-full hover:opacity-90 transition-opacity duration-300 disabled:opacity-50"
        >
          Delete Group
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-lk-s1 dark:bg-dk-s1 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold text-lk-t1 dark:text-dk-t1">Admin Panel</h2>
        <button
          onClick={onClose}
          className="text-lk-t3 dark:text-dk-t3 hover:text-lk-t1 dark:hover:text-dk-t1"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-2 mb-6 bg-lk-s3 dark:bg-dk-s3 p-1 rounded-full w-fit">
        <button
          onClick={() => setActiveTab('members')}
          className={`py-1.5 px-4 rounded-full font-medium text-sm transition-colors ${
            activeTab === 'members'
              ? 'bg-lk-accent dark:bg-dk-accent text-white'
              : 'text-lk-t2 dark:text-dk-t2 hover:text-lk-t1 dark:hover:text-dk-t1'
          }`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab('banned')}
          className={`py-1.5 px-4 rounded-full font-medium text-sm transition-colors ${
            activeTab === 'banned'
              ? 'bg-lk-accent dark:bg-dk-accent text-white'
              : 'text-lk-t2 dark:text-dk-t2 hover:text-lk-t1 dark:hover:text-dk-t1'
          }`}
        >
          Banned
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-1.5 px-4 rounded-full font-medium text-sm transition-colors ${
            activeTab === 'settings'
              ? 'bg-lk-accent dark:bg-dk-accent text-white'
              : 'text-lk-t2 dark:text-dk-t2 hover:text-lk-t1 dark:hover:text-dk-t1'
          }`}
        >
          Settings
        </button>
      </div>

      <div>
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'banned' && renderBannedUsersTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-lk-s1 dark:bg-dk-s1 p-6 rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,.09),0_2px_8px_rgba(0,0,0,.05)] border border-lk-border dark:border-dk-border">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-lk-border dark:border-dk-border border-t-lk-accent dark:border-t-dk-accent mr-3"></div>
              <span className="text-lk-t1 dark:text-dk-t1">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;