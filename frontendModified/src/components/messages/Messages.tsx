import  { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../layouts/Layout';
import pusherService from '../../services/pusherService';
import authService from '../../services/auth';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import messageService from '../../services/messageService';
import { ChatScreen, ChatHeader, LoadingSpinner } from './MessagesShared';
import { DoorOpen, LogOutIcon } from 'lucide-react';
import auth from '../../services/auth';

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
  id: number;
  username: string;
  email: string;
}

const Messages = () => {
  const { username } = useParams<{ username: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser : User = authService.getCurrentUser() || { id: 0, username: '', email: '' };

  // Load messages and subscribe to real-time updates
  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    // If viewing own messages, load and subscribe to messages
    if (currentUser && currentUser.username === username) {
      const loadMessages = async () => {
        try {
          const response = await messageService.getMessages(username!);
          setMessages(response.messages || []);
        } catch (error) {
          console.error('Failed to load messages', error);
        } finally {
          setLoading(false);
        }
      };

      loadMessages();

      const handleNewMessage = (data: Message) => {
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
            id: data.id,
            username: data.username,
            content: data.content,
            created_at: data.created_at,
            media_urls: data.media_urls || []
          }];
        });
      };

      setTimeout(() => pusherService.subscribeToIndividualMessages(username!, handleNewMessage), 1500);

      return () => {
        pusherService.unsubscribe(`messages-${username}`);
      };
    } else {
      // If viewing someone else's messages, just show the form (no messages loaded)
      setLoading(false);
    }
  }, [username]);

  const handleSend = async (message: string, files: File[]): Promise<void> => {
    try {
      await messageService.sendIndividualMessage(username!, message, files);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const isOwnMessages = currentUser && currentUser.username === username;

  if (loading) {
    return (
      <Layout navItems={
        [
          {
            title: 'Logout',
            icon: <DoorOpen className='w-5 h-5' />,
            to: '#',
            onClick: () => {auth.logout()}
          }
        ]
      }>
        <ChatScreen>
          <ChatHeader 
            title={isOwnMessages ? `Your Messages` : `Send Message to ${username}`}
            onToggleMembers={handleLogout}
          />
          <LoadingSpinner />
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
        <div className="grow overflow-y-auto p-4 scrollbar-hide">
          <MessageList messages={messages} currentUser={currentUser} groupType={false}/>
        </div>
        
        {!isOwnMessages && (
          <div className="p-4 border-t border-gray-200">
            <MessageForm onMessageSent={handleSend} />
          </div>
        )}
      </ChatScreen>
    </Layout>
  );
};

export default Messages;