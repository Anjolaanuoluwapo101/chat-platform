import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import groupService from '../services/groupService';
import './GroupList.css';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getUserGroups();
      console.log(response.data.groups)
      setGroups(response.data.groups || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts) => {
    const date = new Date(ts * 1000);
    const now = new Date();
    const diff = now - date;

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

  if (loading) return <div className="group-list-loading">Loading groups...</div>;
  if (error) return <div className="group-list-error">{error}</div>;

  return (
    <div className="group-list">
      <div className="group-list-header">
        <h2>Your Groups</h2>
      </div>
      {groups.length === 0 ? (
        <div className="no-groups">No groups yet</div>
      ) : (
        <ul className="group-items">
          {groups.map((group) => (
            <li key={group.id} className="group-item">
              <Link to={`/groups/${group.id}`} className="group-link">
                <div className="group-info">
                  <div className="group-name">{group.name} {group.is_anonymous ? <span className="anonymous-badge">(Anonymous)</span> : ''}</div>
                  <div className="group-last-message">{group.last_message_summary}</div>
                </div>
                <div className="group-meta">
                  <div className="group-time">{formatTimestamp(group.last_message_ts)}</div>
                  {group.unread_count > 0 && (
                    <div className="unread-count">{group.unread_count}</div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupList;