import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import auth from '../../services/auth';
import groupService from '../../services/groupService';
import { ChatScreen, ChatHeader, LoadingSpinner } from '../messages/MessagesShared';
import Layout from '../../layouts/Layout';
import { DoorOpen } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';
import { GroupsIcon } from './AdminIcons';
import { HomeIcon, SettingsIcon } from 'lucide-react';



interface Group {
  id: number;
  name: string;
  is_anonymous: boolean;
  last_message_summary?: string;
  last_message_ts?: number;
  unread_count?: number;
}

const GroupList = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getUserGroups();
      setGroups(response.groups || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts: number) => {
    // Handle invalid or zero timestamps
    if (!ts || ts <= 0) {
      return '';
    }
    
    const date = new Date(ts * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Otherwise
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const navItems = [
    {
      title: 'Create Group',
      icon: <GroupsIcon className='w-5 h-5' />,
      to: '',
      onClick: () => { setShowCreateModal(true) }
    },
    {
      title: 'Dashboard',
      icon: <HomeIcon className='w-5 h-5' />,
      to: '/dashboard',
      onClick: () => { }
    },
    {
      title: 'Groups',
      icon: <DoorOpen className='w-5 h-5' />,
      to: '/groups',
      onClick: () => { }
    },
    {
      title: 'Settings',
      icon: <SettingsIcon className='w-5 h-5' />,
      to: '',
      onClick: () => {}
    },
    {
      title: 'Logout',
      icon: <DoorOpen className='w-5 h-5' />,
      to: '',
      onClick: () => { auth.logout() }
    }
  ]

  if (loading) return (
    <Layout>
      <ChatScreen>
        <ChatHeader title="Your Groups" />
        <LoadingSpinner />
      </ChatScreen>
    </Layout>
  );

  if (error) return (
    <Layout>
      <ChatScreen>
        <ChatHeader title="Your Groups" />
        <div className="p-8 text-center text-red-500 font-medium">
          {error}
        </div>
      </ChatScreen>
    </Layout>
  );

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    await loadGroups();
  };

  return (
    <Layout navItems={navItems}>
      <ChatScreen>
        <ChatHeader title="Your Groups" />
        {groups.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-lg text-gray-500 font-medium">No groups yet</div>
            <div className="mt-2 text-sm text-gray-400">Join or create a group to get started</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition-colors duration-150"
            >
              Create Group
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="block border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 px-6 py-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-medium text-gray-900 truncate">
                        {group.name}
                      </h3>
                      {group.is_anonymous && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 truncate float-left">
                      {group.last_message_summary || 'No messages yet'}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end shrink-0">
                    {group.last_message_ts && Number(group.last_message_ts) > 0 && (
                      <p className="text-xs text-gray-400">
                        {formatTimestamp(Number(group.last_message_ts))}
                      </p>
                    )}
                    {group.unread_count !== undefined && group.unread_count !== null && Number(group.unread_count) > 0 && (
                      <div className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold">
                        {group.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </ChatScreen>

      {showCreateModal && <CreateGroupModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />}
    </Layout>
  );
};

export default GroupList;