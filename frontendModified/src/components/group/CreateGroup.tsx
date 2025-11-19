import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import groupService from '../../services/groupService';

interface CreateGroupProps {
  onSuccess?: () => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await groupService.createGroup(groupName.trim(), isAnonymous);
      
      if (response.success && response.group_id) {
        // Call onSuccess callback if provided, otherwise navigate
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(`/groups/${response.group_id}`);
        }
      } else {
        setError('Failed to create group');
      }
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Group Name
        </label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          disabled={loading}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          disabled={loading}
          className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        />
        <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Anonymous Group (usernames hidden)
        </label>
      </div>
      {error && <div className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors duration-150"
      >
        {loading ? 'Creating...' : 'Create Group'}
      </button>
    </form>
  );
};

export default CreateGroup;