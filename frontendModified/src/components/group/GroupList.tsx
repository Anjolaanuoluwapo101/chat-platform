import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import auth from '../../services/auth';
import groupService from '../../services/groupService';
import { ChatScreen, ChatHeader, LoadingSpinner } from '../messages/MessagesShared';
import Layout from '../../layouts/Layout';
import { DoorOpen } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';
import { getCommonNavItems } from '../nav/sharedNavItems';
import { GroupsIcon } from './AdminIcons';
import { HomeIcon, SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';


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

  const navItems = getCommonNavItems([
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
  ])

  if (loading) return (
    <Layout>
      <div className="min-h-screen text-lk-t1 dark:text-dk-t1 relative z-10 max-w-4xl lg:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative z-10">
          <ChatScreen>
            <ChatHeader title="Your Groups" />
            <LoadingSpinner />
          </ChatScreen>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="min-h-screen text-lk-t1 dark:text-dk-t1 relative z-10 max-w-4xl lg:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="relative z-10">
          <ChatScreen>
            <ChatHeader title="Your Groups" />
            <div className="p-8 text-center text-lk-danger dark:text-dk-danger font-medium">
              {error}
            </div>
          </ChatScreen>
        </div>
      </div>
    </Layout>
  );

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    await loadGroups();
  };

  return (
    <Layout navItems={navItems}>
      <div className="min-h-screen text-lk-t1 dark:text-dk-t1 relative z-10 max-w-4xl lg:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="relative z-10">
          <ChatScreen>
            <ChatHeader title="Your Groups" />
            {groups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="mb-6 w-14 h-14 flex items-center justify-center rounded-2xl bg-lk-accent-pale dark:bg-dk-accent-pale">
                  <DoorOpen className="w-7 h-7 text-lk-accent2 dark:text-dk-accent" />
                </div>
                <div className="text-lg font-display font-bold text-lk-t1 dark:text-dk-t1">No groups yet</div>
                <div className="mt-1 text-sm text-lk-t3 dark:text-dk-t3">Join or create a group to get started</div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 bg-lk-accent dark:bg-dk-accent hover:bg-lk-accent2 dark:hover:bg-dk-accent2 text-white font-display font-bold py-3 px-8 rounded-full transition-colors duration-300"
                >
                  Create Group
                </button>
              </motion.div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {groups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="block border-b border-lk-border2 dark:border-dk-border2 hover:bg-lk-s2 dark:hover:bg-dk-s2 transition-colors duration-150 px-6 py-4"
                  >
                    <Link to={`/groups/${group.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent font-display font-bold">
                          {group.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-medium text-lk-t1 dark:text-dk-t1 truncate">
                              {group.name}
                            </h3>
                            {group.is_anonymous && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent flex-shrink-0">
                                Anonymous
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-lk-t3 dark:text-dk-t3 truncate">
                            {group.last_message_summary || 'No messages yet'}
                          </p>
                        </div>
                        <div className="ml-2 flex flex-col items-end shrink-0">
                          {group.last_message_ts && Number(group.last_message_ts) > 0 && (
                            <p className="text-xs text-lk-t3 dark:text-dk-t3">
                              {formatTimestamp(Number(group.last_message_ts))}
                            </p>
                          )}
                          {group.unread_count !== undefined && group.unread_count !== null && Number(group.unread_count) > 0 && (
                            <div className="mt-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-lk-accent dark:bg-dk-accent text-white text-[10px] font-semibold">
                              {group.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </ChatScreen>
        </div>
      </div>

      {showCreateModal && <CreateGroupModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />}
    </Layout>
  );
};

export default GroupList;