import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import groupService from '../../services/groupService';
import { MembersIcon } from './AdminIcons'; // Import MembersIcon for header

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

  // Loading animation component - reused for consistency
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) return (
    <div className="w-full bg-white min-h-screen">
      {/* Header with MembersIcon */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <MembersIcon className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Your Groups</h2>
        </div>
      </div>
      {/* Loading animation */}
      <div className="bg-white">
        <LoadingSkeleton />
      </div>
    </div>
  );

  if (error) return (
    <div className="w-full bg-white min-h-screen">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <MembersIcon className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Your Groups</h2>
        </div>
      </div>
      <div className="p-8 text-center">
        <div className="text-red-500">{error}</div>
      </div>
    </div>
  );

  return (
    // Full screen container with no side margins
    <div className="w-full bg-white min-h-screen border-2 border-gray-400 rounded-md">
      {/* Enhanced header with MembersIcon */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <MembersIcon className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Your Groups</h2>
        </div>
      </div>
      
      {groups.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-lg text-gray-500">No groups yet</div>
          <div className="mt-2 text-sm text-gray-400">Join or create a group to get started</div>
        </div>
      ) : (
        // Improved group list with better hover effects
        <div className="bg-white">
          {groups.map((group) => (
            // Enhanced hover effect with smooth transition and shadow
            <div 
              key={group.id} 
              className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ease-in-out hover:shadow-sm"
            >
              <Link to={`/groups/${group.id}`} className="block px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="text-base font-medium text-gray-900 truncate">
                        {group.name}
                      </div>
                      {group.is_anonymous && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 truncate text-left">
                      {group.last_message_summary || 'No messages yet'}
                    </div>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <div className="text-sm text-gray-500">
                      {group.last_message_ts ? formatTimestamp(group.last_message_ts) : ''}
                    </div>
                    {group.unread_count && group.unread_count > 0 && (
                      <div className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-medium">
                        {group.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList;