import React from 'react';
import { AnonymousIcon, CloseIcon } from '../../ui/NavBar';

/**
 * Chat Screen Container
 * Main container for chat interfaces with iPhone-like styling
 */
export const ChatScreen = ({ children }) => (
  <div className="max-w mx-auto h-[90vh] border border-gray-300 rounded-xl bg-gray-100 flex flex-col overflow-hidden shadow-lg">
    {children}
  </div>
);

/**
 * Chat Header Component
 * Enhanced header with anonymous icon and consistent styling
 */
export const ChatHeader = ({ title, isAnonymous, membersCount, onToggleMembers, showMembersButton = false }) => (
  <header className="px-4 py-3 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 flex justify-between items-center">
    <div className="flex items-center gap-2">
      <AnonymousIcon className="w-6 h-6 text-gray-700" />
      <h2 className="font-bold text-lg">
        {title} 
        {isAnonymous && <span className="ml-2 text-xs font-normal text-gray-500">(Anonymous)</span>}
      </h2>
    </div>
    {showMembersButton && (
      <button 
        onClick={onToggleMembers}
        className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
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
  <div className="flex items-center justify-center flex-grow">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

/**
 * Join Group View Component
 * Consistent styling for group joining interface
 */
export const JoinGroupView = ({ onJoin }) => (
  <div className="flex flex-col items-center justify-center flex-grow p-5 text-center">
    <div className="mb-4 p-3 bg-blue-100 rounded-full">
      <AnonymousIcon className="w-12 h-12 text-blue-600" />
    </div>
    <p className="mb-6 text-gray-700">You are not a member of this group. Would you like to join?</p>
    <button 
      onClick={onJoin}
      className="px-6 py-3 font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
    >
      Join Group
    </button>
  </div>
);

/**
 * Members List Component
 * Styled list of group members
 */
export const MembersList = ({ members }) => (
  <div className="p-4 bg-gray-50 border-b border-gray-200 max-h-40 overflow-y-auto">
    <h3 className="mb-3 font-bold text-gray-800">Group Members</h3>
    <ul className="space-y-2">
      {members.map(member => (
        <li key={member.id} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-700">{member.username}</span>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Load More Button Component
 * Consistent styling for pagination
 */
export const LoadMoreButton = ({ onClick, loading, hasMore }) => {
  if (!hasMore) return null;
  
  return (
    <div className="text-center my-4">
      <button 
        onClick={onClick}
        disabled={loading}
        className="px-4 py-2 text-sm font-bold text-blue-500 bg-white border border-blue-500 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
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
export const MessageBubble = ({ isSent, sender, content, mediaUrls, timestamp, renderMedia, repliedMessage }) => {
  const bubbleClass = isSent 
    ? 'bg-gradient-to-b from-blue-300 to-blue-400 border border-blue-400 text-gray-800' 
    : 'bg-white border border-gray-300 text-gray-900';
    
  const alignmentClass = isSent ? 'ml-auto' : 'mr-auto';
  
  return (
    <div className={`max-w-[85%] ${alignmentClass}`}>
      {/* Sender name for received messages in group chats */}
      {!isSent && sender && (
        <div className="text-xs text-gray-500 mb-1 ml-4">
          {sender}
        </div>
      )}
      
      <div className={`rounded-2xl px-4 py-2 relative shadow-sm ${bubbleClass}`}>
        {/* Replied message preview - using lighter blue instead of white */}
        {repliedMessage && (
          <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-xs font-semibold text-blue-700">
              {repliedMessage.username}
            </div>
            <div className="text-xs text-blue-600 truncate">
              {repliedMessage.content}
            </div>
            {repliedMessage.mediaUrls && repliedMessage.mediaUrls.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {repliedMessage.mediaUrls.slice(0, 3).map((url, idx) => (
                  <div key={idx} className="w-8 h-8 bg-blue-100 rounded overflow-hidden">
                    {renderMedia(url, idx)}
                  </div>
                ))}
                {repliedMessage.mediaUrls.length > 3 && (
                  <div className="w-8 h-8 bg-blue-200 rounded flex items-center justify-center text-xs text-blue-700">
                    +{repliedMessage.mediaUrls.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {content && (
          <div className="text-sm whitespace-pre-wrap">{content}</div>
        )}
        
        {mediaUrls && mediaUrls.length > 0 && (
          <div className="mt-2 space-y-2">
            {mediaUrls.map((url, idx) => renderMedia(url, idx))}
          </div>
        )}
        
        {timestamp && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * No Messages Component
 * Empty state for message lists
 */
export const NoMessages = () => (
  <div className="flex items-center justify-center flex-grow">
    <div className="text-center p-8">
      <div className="mb-4 p-3 bg-gray-100 rounded-full inline-block">
        <AnonymousIcon className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-gray-500">No messages yet. Start the conversation!</p>
    </div>
  </div>
);

/**
 * Message Form Wrapper
 * Container for message input with file previews
 */
export const MessageFormWrapper = ({ children, selectedFiles, onRemoveFile }) => (
  <div className="flex-shrink-0">
    {selectedFiles && selectedFiles.length > 0 && (
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-t border-gray-200">
        {selectedFiles.map((file, index) => (
          <div key={index} className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 text-xs">
            <span className="truncate max-w-[80px]">{file.name}</span>
            <button
              type="button"
              onClick={() => onRemoveFile(index)}
              className="ml-2 text-gray-500 hover:text-gray-700"
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
 * Styled form for sending messages
 */
export const MessageFormContainer = ({ onSubmit, children }) => (
  <form onSubmit={onSubmit} className="flex items-end p-3 bg-gradient-to-b from-gray-100 to-gray-200 border-t border-gray-300">
    {children}
  </form>
);

/**
 * File Attach Button
 * Consistent styling for file attachment
 */
export const AttachButton = ({ onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
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
export const MessageTextarea = ({ value, onChange, placeholder, rows = 1, disabled = false }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    disabled={disabled}
    className="flex-grow px-4 py-2 text-sm border border-gray-300 rounded-2xl resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
);

/**
 * Send Button
 * Consistent styling for message sending
 */
export const SendButton = ({ disabled = false, loading = false }) => (
  <button 
    type="submit" 
    disabled={disabled || loading}
    className="ml-2 px-4 py-2 bg-gradient-to-b from-green-400 to-green-500 text-white font-medium rounded-2xl shadow-sm hover:from-green-500 hover:to-green-600 disabled:opacity-50 transition-all"
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
export const ErrorMessage = ({ message, setMessage }) => (
  message ? (
    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 text-center">
      {/* A hide button on the top right corner */}
      <div className='absolute right-2 top-2' onClick={() => setMessage(null) }> <CloseIcon /> </div>
      {message}
    </div>
  ) : null
);
