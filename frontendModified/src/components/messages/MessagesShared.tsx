import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AnonymousIcon, CloseIcon } from '../../ui/NavBar';

interface Member {
  id: number;
  username: string;
}

interface RepliedMessage {
  username: string;
  content: string;
  mediaUrls?: string[];
}

/**
 * Chat Screen Container
 * Main container for chat interfaces - optimized spacing
 */
export const ChatScreen = ({ children }: { children: ReactNode }) => (
  <div className="h-[90vh] border border-slate-600 rounded-xl bg-slate-800/50 backdrop-blur-sm flex flex-col overflow-hidden shadow-lg m-4">
    {children}
  </div>
);

/**
 * Chat Header Component
 * Header with consistent padding and symmetrical spacing
 */
export const ChatHeader = ({ 
  title, 
  isAnonymous, 
  membersCount, 
  onToggleMembers, 
  showMembersButton = false 
}: { 
  title: string; 
  isAnonymous?: boolean; 
  membersCount?: number; 
  onToggleMembers?: () => void; 
  showMembersButton?: boolean; 
}) => (
  <header className="px-6 py-4 bg-linear-to-b from-slate-800 to-slate-700 border-b border-slate-600 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <AnonymousIcon className="w-6 h-6 text-amber-400" />
      <h2 className="font-bold text-lg text-white">
        {title} 
        {isAnonymous && <span className="ml-2 text-xs font-normal text-slate-300">(Anonymous)</span>}
      </h2>
    </div>
    {showMembersButton && onToggleMembers && (
      <button 
        onClick={onToggleMembers}
        className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors px-2"
      >
        Members ({membersCount})
      </button>
    )}
  </header>
);

/**
 * Loading Spinner Component
 * Consistent loading indicator with auth styling
 */
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center grow">
    <div className="w-10 h-10 border-4 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
  </div>
);

/**
 * Join Group View Component
 * Centered layout with symmetrical padding
 */
export const JoinGroupView = ({ onJoin, isLoading  }: { onJoin: () => void, isLoading?: boolean }) => (
  <div className="flex flex-col items-center justify-center grow p-8 text-center bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600">
    <div className="mb-6 p-4 bg-slate-700/50 rounded-full">
      <AnonymousIcon className="w-12 h-12 text-amber-400" />
    </div>
    <p className="mb-8 text-slate-300">You are not a member of this group. Would you like to join?</p>
    <button 
      onClick={onJoin}
      disabled={isLoading}
      className="px-8 py-3 font-semibold text-white bg-linear-to-r from-amber-500 to-orange-500 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Joining...' : 'Join Group'}
    </button>
  </div>
);

/**
 * Members List Component
 * List with consistent padding all around
 */
export const MembersList = ({ members }: { members: Member[] }) => (
  <div className="p-6 bg-slate-800/80 backdrop-blur-sm border-b border-slate-600 max-h-40 overflow-y-auto">
    <h3 className="mb-4 font-bold text-white">Group Members</h3>
    <ul className="space-y-3">
      {members.map(member => (
        <li key={member.id} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm text-slate-200">{member.username}</span>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Load More Button Component
 * Centered with symmetrical vertical margins
 */
export const LoadMoreButton = ({ onClick, loading, hasMore }: { onClick: () => void; loading: boolean; hasMore: boolean }) => {
  if (!hasMore) return null;
  
  return (
    <div className="text-center my-6">
      <button 
        onClick={onClick}
        disabled={loading}
        className="px-6 py-2 text-sm font-bold text-amber-400 bg-slate-800 border border-amber-500 rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
};

/**
 * Message Bubble Component
 * Enhanced message bubbles with consistent styling
 */
export const MessageBubble = ({ 
  isSent, 
  sender, 
  content, 
  mediaUrls, 
  timestamp, 
  renderMedia, 
  repliedMessage 
}: { 
  isSent: boolean; 
  sender?: string; 
  content?: string; 
  mediaUrls?: string[]; 
  timestamp?: string; 
  renderMedia: (url: string, idx: number) => ReactNode; 
  repliedMessage?: RepliedMessage; 
}) => {
  const bubbleClass = isSent 
    ? 'bg-linear-to-b from-amber-500/80 to-orange-500/80 border border-amber-400 text-white' 
    : 'bg-slate-800/80 border border-slate-600 text-white';
    
  const alignmentClass = isSent ? 'ml-auto' : 'mr-auto';
  
  // Function to decode HTML entities
  const decodeHtmlEntities = (text: string): string => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };
  
  return (
    <motion.div 
      className={`max-w-[85%] ${alignmentClass}`}
      whileHover={{ scale: 1.03 }}
    >
      {/* Sender name for received messages in group chats */}
      {!isSent && sender && (
        <div className="text-xs text-slate-400 mb-1 ml-2 text-left">
          {sender}
        </div>
      )}
      
      <div className={`rounded-2xl px-5 py-3 relative shadow-sm ${bubbleClass} transition-colors duration-200 mb-2`}>
        {/* Replied message preview - consistent padding */}
        {repliedMessage && (
          <div className="mb-3 p-3 bg-slate-700/50 rounded-lg border border-slate-500">
            <div className="text-xs font-semibold text-amber-400 text-left">
              {repliedMessage.username}
            </div>
            <div className="text-xs text-slate-300 truncate text-left">
              {repliedMessage.content}
            </div>
            {repliedMessage.mediaUrls && repliedMessage.mediaUrls.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {repliedMessage.mediaUrls.slice(0, 3).map((url, idx) => (
                  <div key={idx} className="w-8 h-8 bg-slate-600 rounded overflow-hidden">
                    {renderMedia(url, idx)}
                  </div>
                ))}
                {repliedMessage.mediaUrls.length > 3 && (
                  <div className="w-8 h-8 bg-slate-500 rounded flex items-center justify-center text-xs text-slate-300">
                    +{repliedMessage.mediaUrls.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {content && (
          <div className="text-sm whitespace-pre-wrap text-left">
            {decodeHtmlEntities(content)}
          </div>
        )}
        
        {mediaUrls && mediaUrls.length > 0 && (
          <div className="mt-3 space-y-2">
            {mediaUrls.map((url, idx) => renderMedia(url, idx))}
          </div>
        )}
        
        {timestamp && (
          <div className="text-xs text-slate-400 mt-1 text-right">
            {timestamp}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * No Messages Component
 * Centered empty state with proportional padding
 */
export const NoMessages = () => (
  <div className="flex items-center justify-center grow">
    <div className="text-center p-10 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600 w-full max-w-md">
      <div className="mb-6 p-4 bg-slate-700/50 rounded-full inline-block">
        <AnonymousIcon className="w-10 h-10 text-amber-400" />
      </div>
      <p className="text-slate-300">No messages yet. Start the conversation!</p>
    </div>
  </div>
);

/**
 * Message Form Wrapper
 * Container for message input with file previews
 */
export const MessageFormWrapper = ({ 
  children, 
  selectedFiles, 
  onRemoveFile 
}: { 
  children: ReactNode; 
  selectedFiles?: File[]; 
  onRemoveFile?: (index: number) => void; 
}) => (
  <div className="shrink-0">
    {selectedFiles && selectedFiles.length > 0 && onRemoveFile && (
      <div className="flex flex-wrap gap-2 p-4 bg-slate-800/50 border-t border-slate-600">
        {selectedFiles.map((file, index) => (
          <div key={index} className="flex items-center bg-slate-700 border border-slate-500 rounded-full px-4 py-2 text-xs">
            <span className="truncate max-w-20 text-slate-200">{file.name}</span>
            <button
              type="button"
              onClick={() => onRemoveFile(index)}
              className="ml-2 text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    )}
    {children}
  </div>
);

/**
 * Message Input Form
 * Form with symmetrical padding
 */
export const MessageFormContainer = ({ onSubmit, children }: { onSubmit: (e: React.FormEvent) => void; children: ReactNode }) => (
  <form onSubmit={onSubmit} className="flex items-end p-4 bg-linear-to-b from-slate-800 to-slate-700 border-t border-slate-600">
    {children}
  </form>
);

/**
 * File Attach Button
 * Button with proportional padding
 */
export const AttachButton = ({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="p-3 text-slate-400 hover:text-amber-400 disabled:opacity-50"
    aria-label="Attach file"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  </button>
);

/**
 * Message Textarea
 * Auto-resizing textarea with consistent styling
 */
export const MessageTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  rows = 1, 
  disabled = false 
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  placeholder: string; 
  rows?: number; 
  disabled?: boolean; 
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    disabled={disabled}
    className="grow px-5 py-3 text-sm bg-slate-700 text-white border border-slate-600 rounded-2xl resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
  />
);

/**
 * Send Button
 * Button with symmetrical spacing
 */
export const SendButton = ({ disabled = false, loading = false }: { disabled?: boolean; loading?: boolean }) => (
  <button 
    type="submit" 
    disabled={disabled || loading}
    className="ml-3 px-5 py-3 bg-linear-to-b from-amber-500 to-orange-500 text-white font-medium rounded-2xl shadow-sm hover:shadow-lg transition-all"
  >
    {loading ? (
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ) : 'Send'}
  </button>
);

/**
 * Error Message Component
 * Consistent error display
 */
export const ErrorMessage = ({ message, setMessage }: { message?: string | null; setMessage: (message: string | null) => void }) => (
  message ? (
    <div className="p-4 text-sm text-red-400 bg-slate-800/80 backdrop-blur-sm border border-red-500 text-center relative rounded-lg">
      {/* Close button with proper positioning */}
      <div className='absolute right-3 top-3 cursor-pointer' onClick={() => setMessage(null)}> <CloseIcon className="w-4 h-4 text-slate-300" /> </div>
      {message}
    </div>
  ) : null
);

/**
 * Success Message Component
 * Consistent success display
 */
export const SuccessMessage = ({ message, setMessage }: { message?: string | null; setMessage: (message: string | null) => void }) => (
  message ? (
    <div className="p-4 text-sm text-green-400 bg-slate-800/80 backdrop-blur-sm border border-green-500 text-center relative rounded-lg">
      {/* Close button with proper positioning */}
      <div className='absolute right-3 top-3 cursor-pointer' onClick={() => setMessage(null)}> <CloseIcon className="w-4 h-4 text-slate-300" /> </div>
      {message}
    </div>
  ) : null
);