import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import groupService from '../services/groupService';
import './CreateGroup.css';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await groupService.createGroup(groupName.trim(), isAnonymous);
      
      if (response.data.success && response.data.group_id) {
        // Navigate to the new group
        navigate(`/groups/${response.data.group_id}`);
      } else {
        setError('Failed to create group');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group">
      <h2>Create New Group</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="groupName">Group Name:</label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={loading}
            />
            Anonymous Group (usernames hidden)
          </label>
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;