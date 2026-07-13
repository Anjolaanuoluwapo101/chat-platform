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
        <label htmlFor="groupName" className="block text-[10px] font-bold uppercase tracking-wide text-lk-t3 dark:text-dk-t3 mb-1">
          Group Name
        </label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          disabled={loading}
          className="w-full px-4 py-2.5 bg-lk-s3 dark:bg-dk-s3 text-lk-t1 dark:text-dk-t1 border-2 border-lk-border dark:border-dk-border rounded-[10px] focus:outline-none focus:border-lk-accent dark:focus:border-dk-accent focus:bg-lk-accent-pale dark:focus:bg-dk-accent-pale transition-colors disabled:opacity-50"
        />
      </div>
      <div className="mb-3 flex items-center">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={isAnonymous}
          onChange={() => setIsAnonymous(!isAnonymous)}
          disabled={loading}
          className="h-4 w-4 rounded border-lk-border dark:border-dk-border text-lk-accent dark:text-dk-accent focus:ring-lk-accent dark:focus:ring-dk-accent"
        />
        <label htmlFor="isAnonymous" className="ml-2 text-sm text-lk-t2 dark:text-dk-t2">
          Anonymous Group (usernames hidden)
        </label>
      </div>
      {error && <ErrorMessage message={error} />}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-lk-accent dark:bg-dk-accent hover:bg-lk-accent2 dark:hover:bg-dk-accent2 text-white font-display font-bold py-3 px-4 rounded-full transition-colors duration-300 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Group'}
      </button>
    </motion.form>
  );
};

export default CreateGroup;