import React, { useRef, useEffect } from 'react';
import { baseURL } from '../services/config';

const MessageList = ({ messages, isOwnMessages, groupType, currentUser }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMedia = (url, idx) => {
    const fileExtension = url.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension);
    const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension);

    if (isImage) {
      return <img key={idx} src={baseURL + url} alt="Media" className="media-item" />;
    } else if (isVideo) {
      return (
        <video key={idx} controls className="media-item">
          <source src={url} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (isAudio) {
      return (
        <audio key={idx} controls className="media-item">
          <source src={url} type={`audio/${fileExtension}`} />
          Your browser does not support the audio element.
        </audio>
      );
    } else {
      return (
        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="media-item file-link">
          📎 {url.split('/').pop()}
        </a>
      );
    }
  };

  const getDisplayUsername = (message) => {
    if (groupType && message.username) {
      return message.username;
    }
    return 'Anonymous';
  };

  if (!isOwnMessages) return null;

  return (
    <div className="messages-list">
      {messages.length === 0 ? (
        <div className="no-messages">No messages yet. Start the conversation!</div>
      ) : (
        messages.map((message, index) => (
          <div key={index} className="message-item">
            <div className="message-header">
              <strong className=''>
                {getDisplayUsername(message)}
              </strong>
              <span className="timestamp">{message.created_at}</span>
            </div>
            <div className="message-content">
              {message.content}
            </div>
            {message.media_urls && message.media_urls.length > 0 && (
              <div className="message-media">
                {message.media_urls.map((url, idx) => renderMedia(url, idx))}
              </div>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
