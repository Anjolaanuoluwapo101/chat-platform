import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../layouts/Layout';
import pusherService from '../../services/pusherService';
import authService from '../../services/auth';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import messageService from '../../services/messageService';
import { ChatScreen, ChatHeader, LoadingSpinner } from './MessagesShared';

const Messages = () => {
  const { username } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = authService.getCurrentUser();

  // Load messages and subscribe to real-time updates
  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    // If viewing own messages, load and subscribe to messages
    if (currentUser && currentUser.username === username) {
      const loadMessages = async () => {
        try {
          const response = await messageService.getMessages(username);
          setMessages(response.data.messages);
        } catch (error) {
          console.error('Failed to load messages', error);
        } finally {
          setLoading(false);
        }
      };

      loadMessages();

      const handleNewMessage = (data) => {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg =>
            msg.created_at === data.created_at &&
            msg.content === data.content
          );

          if (messageExists) {
            return prev; // Return unchanged state if duplicate
          }

          return [...prev, {
            username: data.username,
            content: data.content,
            created_at: data.created_at,
            media_urls: data.media_urls || []
          }];
        });
      };

      pusherService.subscribeToIndividualMessages(username, handleNewMessage);

      return () => {
        pusherService.unsubscribe(`messages-${username}`);
      };
    } else {
      // If viewing someone else's messages, just show the form (no messages loaded)
      setLoading(false);
    }
  }, []);


  const handleSend = async (message, files) => {
    try {
      const response = await messageService.sendIndiviualMessage(username, message, files);
      return response.data; // Return result to MessageForm
    } catch (err) {
      console.error('Failed to send message', err);
      return { success: false };
    }
  }

  const handleLogout = () => {
    authService.logout();
  };

  const isOwnMessages = currentUser && currentUser.username === username;

  if (loading) {
    return (
      <Layout>
        <ChatScreen>
          <ChatHeader 
            title={isOwnMessages ? `Your Messages` : `Send Message to ${username}`}
            onToggleMembers={handleLogout}
          />
          <div className="flex items-center justify-center flex-grow">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading messages...</p>
            </div>
          </div>
        </ChatScreen>
      </Layout>
    );
  }

  return (
    <Layout>
      <ChatScreen>
        <ChatHeader 
          title={isOwnMessages ? `Your Messages` : `Send Message to ${username}`}
          onToggleMembers={handleLogout}
        />
        {/* Fill available space and hide ugly overscroll while maintaining scrolling */}
        <div className="flex-grow overflow-y-auto p-4 scrollbar-hide">
          <MessageList messages={messages} currentUser={currentUser} groupType={false}/>
        </div>
        
        {!isOwnMessages && (
          <div className="p-4 border-t border-gray-200">
            <MessageForm username={username} onMessageSent={handleSend} />
          </div>
        )}
      </ChatScreen>
    </Layout>
  );
};

export default Messages;