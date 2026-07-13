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
  <div className="h-[90vh] border border-lk-border dark:border-dk-border rounded-[14px] bg-lk-s1 dark:bg-dk-s1 flex flex-col overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.06),0_1px_3px_rgba(0,0,0,.04)] m-4">
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
  <header className="px-6 py-4 bg-lk-s1 dark:bg-dk-s1 border-b border-lk-border2 dark:border-dk-border2 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <AnonymousIcon className="w-6 h-6 text-lk-accent dark:text-dk-accent" />
      <h2 className="font-display font-bold text-lg text-lk-t1 dark:text-dk-t1">
        {title}
        {isAnonymous && <span className="ml-2 text-xs font-normal text-lk-t3 dark:text-dk-t3">(Anonymous)</span>}
      </h2>
    </div>
    {showMembersButton && onToggleMembers && (
      <button
        onClick={onToggleMembers}
        className="text-sm font-bold text-lk-accent2 dark:text-dk-accent hover:opacity-80 transition-colors px-2"
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
    <div className="w-10 h-10 border-4 border-lk-border dark:border-dk-border border-t-lk-accent dark:border-t-dk-accent rounded-full animate-spin"></div>
  </div>
);

/**
 * Join Group View Component
 * Centered layout with symmetrical padding
 */
export const JoinGroupView = ({ onJoin, isLoading  }: { onJoin: () => void, isLoading?: boolean }) => (
  <div className="flex flex-col items-center justify-center grow p-8 text-center bg-lk-s1 dark:bg-dk-s1">
    <div className="mb-6 w-14 h-14 flex items-center justify-center rounded-2xl bg-lk-accent-pale dark:bg-dk-accent-pale">
      <AnonymousIcon className="w-8 h-8 text-lk-accent2 dark:text-dk-accent" />
    </div>
    <h3 className="font-display font-extrabold text-lg text-lk-t1 dark:text-dk-t1 mb-1">Members only</h3>
    <p className="mb-8 text-sm text-lk-t3 dark:text-dk-t3 max-w-xs">Join this group to see messages and participate in the conversation</p>
    <button
      onClick={onJoin}
      disabled={isLoading}
      className="px-8 py-3 font-display font-bold text-white bg-lk-accent dark:bg-dk-accent rounded-full hover:bg-lk-accent2 dark:hover:bg-dk-accent2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs tracking-wide"
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
  <div className="p-6 bg-lk-s2 dark:bg-dk-s2 border-b border-lk-border2 dark:border-dk-border2 max-h-40 overflow-y-auto">
    <h3 className="mb-4 font-display font-bold text-lk-t1 dark:text-dk-t1">Group Members</h3>
    <ul className="space-y-3">
      {members.map(member => (
        <li key={member.id} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-lk-accent dark:bg-dk-accent"></div>
          <span className="text-sm text-lk-t2 dark:text-dk-t2">{member.username}</span>
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
        className="px-6 py-2 text-xs font-bold text-lk-t3 dark:text-dk-t3 hover:text-lk-accent2 dark:hover:text-dk-accent transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : '↑ Load earlier'}
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
    ? 'bg-lk-bubble-out dark:bg-dk-bubble-out text-lk-t1 dark:text-dk-t1 rounded-2xl rounded-br-[5px]'
    : 'bg-lk-bubble-in dark:bg-dk-bubble-in text-lk-t1 dark:text-dk-t1 rounded-2xl rounded-bl-[5px]';

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
      whileHover={{ scale: 1.01 }}
    >
      {/* Sender name for received messages in group chats */}
      {!isSent && sender && (
        <div className="text-xs text-lk-t3 dark:text-dk-t3 mb-1 ml-2 text-left">
          {sender}
        </div>
      )}

      <div className={`px-4 py-2.5 relative ${bubbleClass} transition-colors duration-200 mb-1`}>
        {/* Replied message preview - consistent padding */}
        {repliedMessage && (
          <div className="mb-2 p-2.5 bg-lk-accent-pale dark:bg-dk-accent-pale rounded-lg border-l-2 border-lk-accent dark:border-dk-accent">
            <div className="text-xs font-semibold text-lk-accent2 dark:text-dk-accent text-left">
              {repliedMessage.username}
            </div>
            <div className="text-xs text-lk-t2 dark:text-dk-t2 truncate text-left">
              {repliedMessage.content}
            </div>
            {repliedMessage.mediaUrls && repliedMessage.mediaUrls.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {repliedMessage.mediaUrls.slice(0, 3).map((url, idx) => (
                  <div key={idx} className="w-8 h-8 bg-lk-s3 dark:bg-dk-s3 rounded overflow-hidden">
                    {renderMedia(url, idx)}
                  </div>
                ))}
                {repliedMessage.mediaUrls.length > 3 && (
                  <div className="w-8 h-8 bg-lk-s3 dark:bg-dk-s3 rounded flex items-center justify-center text-xs text-lk-t3 dark:text-dk-t3">
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
      </div>
      {timestamp && (
        <div className={`text-[9px] text-lk-t3 dark:text-dk-t3 ${isSent ? 'text-right' : 'text-left'} ml-1 mr-1`}>
          {timestamp}
        </div>
      )}
    </motion.div>
  );
};

/**
 * No Messages Component
 * Centered empty state with proportional padding
 */
export const NoMessages = () => (
  <div className="flex items-center justify-center grow">
    <div className="text-center p-10 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border w-full max-w-md">
      <div className="mb-6 p-4 bg-lk-accent-pale dark:bg-dk-accent-pale rounded-full inline-block">
        <AnonymousIcon className="w-10 h-10 text-lk-accent2 dark:text-dk-accent" />
      </div>
      <h3 className="font-display font-extrabold text-lg text-lk-t1 dark:text-dk-t1 mb-1">Chat Over!</h3>
      <p className="text-lk-t3 dark:text-dk-t3">No messages yet. Start the conversation!</p>
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
      <div className="flex flex-wrap gap-2 p-4 bg-lk-s2 dark:bg-dk-s2 border-t border-lk-border2 dark:border-dk-border2">
        {selectedFiles.map((file, index) => (
          <div key={index} className="flex items-center bg-lk-s1 dark:bg-dk-s1 border border-lk-border dark:border-dk-border rounded-full px-4 py-2 text-xs">
            <span className="truncate max-w-20 text-lk-t2 dark:text-dk-t2">{file.name}</span>
            <button
              type="button"
              onClick={() => onRemoveFile(index)}
              className="ml-2 text-lk-t3 dark:text-dk-t3 hover:text-lk-t1 dark:hover:text-dk-t1"
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
  <form onSubmit={onSubmit} className="flex items-end gap-2 p-3 bg-lk-s1 dark:bg-dk-s1 border-t border-lk-border2 dark:border-dk-border2">
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
    className="p-3 text-lk-t3 dark:text-dk-t3 hover:text-lk-accent2 dark:hover:text-dk-accent disabled:opacity-50"
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
    className="grow px-4 py-2.5 text-sm bg-lk-s3 dark:bg-dk-s3 text-lk-t1 dark:text-dk-t1 border-2 border-lk-border dark:border-dk-border rounded-full resize-none max-h-32 focus:outline-none focus:border-lk-accent dark:focus:border-dk-accent focus:bg-lk-accent-pale dark:focus:bg-dk-accent-pale transition-colors"
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
    className="w-11 h-11 flex items-center justify-center shrink-0 bg-lk-accent dark:bg-dk-accent text-white font-medium rounded-[10px] hover:bg-lk-accent2 dark:hover:bg-dk-accent2 transition-colors disabled:opacity-50"
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
    <div className="p-4 text-sm text-lk-danger dark:text-dk-danger bg-lk-danger-pale dark:bg-dk-danger-pale border border-lk-danger/30 dark:border-dk-danger/30 text-center relative rounded-lg">
      {/* Close button with proper positioning */}
      <div className='absolute right-3 top-3 cursor-pointer' onClick={() => setMessage(null)}> <CloseIcon className="w-4 h-4 text-lk-t3 dark:text-dk-t3" /> </div>
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
    <div className="p-4 text-sm text-lk-accent2 dark:text-dk-accent bg-lk-accent-pale dark:bg-dk-accent-pale border border-lk-accent/30 dark:border-dk-accent/30 text-center relative rounded-lg">
      {/* Close button with proper positioning */}
      <div className='absolute right-3 top-3 cursor-pointer' onClick={() => setMessage(null)}> <CloseIcon className="w-4 h-4 text-lk-t3 dark:text-dk-t3" /> </div>
      {message}
    </div>
  ) : null
);