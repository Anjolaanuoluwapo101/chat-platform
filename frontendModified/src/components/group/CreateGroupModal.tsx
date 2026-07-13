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
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-lk-s1 dark:bg-dk-s1 rounded-t-[20px] sm:rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,.09),0_2px_8px_rgba(0,0,0,.05)] w-full max-w-md max-h-[90vh] overflow-y-auto border border-lk-border dark:border-dk-border"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-lk-border dark:bg-dk-border" />
        </div>
        <div className="flex items-center justify-between p-6 border-b border-lk-border2 dark:border-dk-border2 sticky top-0 bg-lk-s1 dark:bg-dk-s1">
          <h2 className="font-display text-xl font-bold text-lk-t1 dark:text-dk-t1">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-lk-t3 dark:text-dk-t3 hover:text-lk-t1 dark:hover:text-dk-t1 text-2xl leading-none font-bold"
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