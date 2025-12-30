import { type ReactNode, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageBubble, NoMessages } from './MessagesShared';

interface Message {
  id: number;
  content: string;
  username?: string;
  created_at: string;
  media_urls?: string[];
  reply_to_message_id?: number;
  replied_message_username?: string;
  replied_message_content?: string;
  replied_message_created_at?: string;
  replied_message_media_urls?: string[];
}

interface User {
  username: string;
}

interface RepliedMessage {
  username: string;
  content: string;
  created_at?: string;
  mediaUrls?: string[];
}

const MessageList = ({ messages, currentUser, groupType, onReply = () => { } }: { messages: Message[]; currentUser: User | null; groupType?: boolean; onReply?: (message: Message) => void }) => {

  // const baseURL= useState("https://talkyourtalk.onrender.com/");
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:80/";
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

  const renderMedia = useCallback((url: string, idx: number): ReactNode => {
    const fileExtension = url.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension);
    const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension);

    if (isImage) { 
      return <img key={idx} src={url} alt="Media" className="max-w-full rounded-lg mt-2" />;
    } else if (isVideo) {
      return (
        <video key={idx} controls className="max-w-full rounded-lg mt-2">
          <source src={url} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (isAudio) {
      return (
        <audio key={idx} controls className="w-full mt-2">
          <source src={url} type={`audio/${fileExtension}`} />
          Your browser does not support the audio element.
        </audio>
      );
    } else {
      return (
        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2 inline-block">
          📎 {url.split('/').pop()}
        </a>
      );
    }
  }, [baseURL]);

  const getDisplayUsername = (message: Message): string => {
    if (groupType && message.username) {
      return message.username;
    }
    return 'Anonymous'; // Fallback for anonymous
  };

  const handleMessageClick = (messageId: number) => {
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId);
  };

  const handleReplyClick = (message: Message, e: React.MouseEvent) => {
    e.stopPropagation();
    onReply(message);
    setSelectedMessageId(null);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedMessageId(null);
    }
  };

  return (
    <>
      {messages.length === 0 ? (
        <NoMessages />
      ) : (
        <div className="space-y-4" onClick={handleOutsideClick}>
          {/* include unique id for each message */}

          {messages.map((message, index) => {
            let isSent = false;
            let sender = '';
            if (groupType && message.username) {
              // Determine if the message was sent by the current user
              isSent = message.username?.toLowerCase() === currentUser?.username.toLowerCase();
              sender = getDisplayUsername(message);
            }

            // Prepare replied message data if exists
            const repliedMessage: RepliedMessage | null = message.reply_to_message_id ? {
              username: message.replied_message_username || '',
              content: message.replied_message_content || '',
              created_at: message.replied_message_created_at || '',
              mediaUrls: message.replied_message_media_urls
            } : null;

            const isSelected = selectedMessageId === message.id;

            return (
              <motion.div 
                key={message.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className={`relative ${groupType ? 'cursor-pointer' : ''}`}
                onClick={() => groupType && handleMessageClick(message.id)}
              >
                <MessageBubble
                  isSent={isSent}
                  sender={!isSent && groupType ? sender : undefined}
                  content={message.content}
                  mediaUrls={message.media_urls}
                  timestamp={message.created_at}
                  renderMedia={renderMedia}
                  repliedMessage={repliedMessage || undefined}
                />
                {/* Reply button that appears when message is clicked - only in group chats */}
                {groupType && isSelected && (
                  <button
                    onClick={(e) => handleReplyClick(message, e)}
                    className="absolute bottom-0 right-0 mb-2 mr-2 bg-slate-700 rounded-full p-1 shadow-md hover:bg-slate-600"
                    aria-label="Reply to message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MessageList;