import React from 'react';
import CreateGroup from './CreateGroup';
import { motion } from 'framer-motion';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-600"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-600 sticky top-0 bg-slate-800">
          <h2 className="text-xl font-bold text-white">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl leading-none font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <CreateGroup onSuccess={onSuccess} />
        </div>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;