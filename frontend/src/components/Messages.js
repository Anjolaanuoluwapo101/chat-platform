import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import pusherService from '../services/pusherService';
import authService from '../services/auth';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import messageService from '../services/messageService';

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
          console.error('Failed to load messages');
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

      // return () => {
      //   pusherService.unsubscribe(`messages-${username}`);
      // };
    } else {
      // If viewing someone else's messages, just show the form (no messages loaded)
      setLoading(false);
    }
  }, []);


  const handleSend = async ( message, files) => {
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

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }


  const isOwnMessages = currentUser && currentUser.username === username;

  return (
    <div className="messages-container">
      <header className="messages-header">
        <h2>{isOwnMessages ? `Your Messages` : `Send Message to ${username}`}</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <MessageList messages={messages} isOwnMessages={isOwnMessages} />

      {!isOwnMessages && <MessageForm username={username} onMessageSent={handleSend} />}
    </div>
  );
};

export default Messages;
