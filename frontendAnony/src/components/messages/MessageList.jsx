import React, { useRef, useEffect } from 'react';
import { MessageBubble, NoMessages } from './MessagesShared';
// import { baseURL } from '../services/config'; // Assumed path
const baseURL = "http://localhost:8000/"; // Mock base URL

const MessageList = ({ messages, currentUser, groupType, onReply = () => {} }) => {
  // The scroll-to-bottom logic is now in the parent
  // We just render the list

  const renderMedia = (url, idx) => {
    const fileExtension = url.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension);
    const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension);

    const fullUrl = baseURL + url;

    if (isImage) {
      return <img key={idx} src={fullUrl} alt="Media" className="max-w-full rounded-lg mt-2" />;
    } else if (isVideo) {
      return (
        <video key={idx} controls className="max-w-full rounded-lg mt-2">
          <source src={fullUrl} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (isAudio) {
      return (
        <audio key={idx} controls className="w-full mt-2">
          <source src={fullUrl} type={`audio/${fileExtension}`} />
          Your browser does not support the audio element.
        </audio>
      );
    } else {
      return (
        <a key={idx} href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2 inline-block">
          📎 {url.split('/').pop()}
        </a>
      );
    }
  };

  const getDisplayUsername = (message) => {
    if (groupType && message.username) {
      return message.username;
    }
    return 'Anonymous'; // Fallback for anonymous
  };

  return (
    <>
      {messages.length === 0 ? (
        <NoMessages />
      ) : (
        <div className="space-y-3">
          {/* include unique id for each message */}
          
          {messages.map((message) => {
            let isSent = false;
            let sender = '';
            if (groupType && message.username) {
              // Determine if the message was sent by the current user
              // CRITICAL: This assumes 'message.user_id' exists and 'currentUserId' is passed
              isSent = message.username?.toLowerCase() === currentUser.username.toLowerCase();
              sender = getDisplayUsername(message);
            }

            // Prepare replied message data if exists
            const repliedMessage = message.reply_to_message_id ? {
              username: message.replied_message_username,
              content: message.replied_message_content,
              created_at: message.replied_message_created_at,
              mediaUrls: message.replied_message_media_urls
            } : null;

            return (
              <div key={message.id} className="relative group">
                <MessageBubble
                  isSent={isSent}
                  sender={!isSent && groupType ? sender : null}
                  content={message.content}
                  mediaUrls={message.media_urls}
                  timestamp={message.created_at}
                  renderMedia={renderMedia}
                  repliedMessage={repliedMessage}
                />
                {/* Reply button that appears on hover */}
                <button 
                  onClick={() => onReply(message)}
                  className="absolute bottom-0 right-0 mb-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  aria-label="Reply to message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MessageList;