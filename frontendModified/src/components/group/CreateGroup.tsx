import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import groupService from '../../services/groupService';
import { ErrorMessage } from '../auth/AuthShared';
import { motion } from 'framer-motion';

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
        return onSuccess ? onSuccess() : navigate(`/group/${response.group_id}`);
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
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="space-y-4"
    >
      <div className='mb-3'>
        <label htmlFor="groupName" className="block text-sm font-medium text-slate-300 mb-1">
          Group Name
        </label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          disabled={loading}
          className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-600"
        />
      </div>
      <div className="mb-3 flex items-center">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={isAnonymous}
          onChange={() => setIsAnonymous(!isAnonymous)}
          disabled={loading}
          className="h-4 w-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
        />
        <label htmlFor="isAnonymous" className="ml-2 text-sm text-slate-300">
          Anonymous Group (usernames hidden)
        </label>
      </div>
      {error && <ErrorMessage message={error} />}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:shadow-lg text-white font-medium py-2 px-4 rounded transition-all duration-300 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Group'}
      </button>
    </motion.form>
  );
};

export default CreateGroup;