import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import groupService from '../../services/groupService';

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
    <div className="max-w-md mx-auto mt-10 p-8 glassmorphism">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Group</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="groupName" className="block mb-2">Group Name:</label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            disabled={loading}
            className="w-full px-3 py-2 bg-white/50 dark:bg-black/50 border border-white/20 dark:border-black/20 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={loading}
              className="mr-2"
            />
            Anonymous Group (usernames hidden)
          </label>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;