import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../layouts/Layout';
import pusherService from '../../services/pusherService';
import authService from '../../services/auth';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import messageService from '../../services/messageService';
import { ChatScreen, ChatHeader, LoadingSpinner } from './MessagesShared';
import { getCommonNavItems } from '../nav/sharedNavItems';
import PushNotificationService from '../../services/notifications';
import { motion } from 'framer-motion';


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

// A component that shows that message has been sent and also puts a link to create an account 
const SentMessage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-20 m-auto text-sm text-lk-accent2 dark:text-dk-accent mb-3 text-center bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border"
    >
      <p>Your Message has been delivered!</p>
      <p className="mt-2">
        <button onClick={() => {
          window.location.href = '/register'
        }} className="text-lk-accent2 dark:text-dk-accent hover:underline font-medium">Create an account to send messages.</button>
      </p>
    </motion.div>
  );
};


const Messages = () => {
  const { username } = useParams<{ username: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false); // Track if we're sending a message
  const [messageSentSuccess, setMessageSentSuccess] = useState(false); // Show "Sent!" confirmation
  const [networkError, setNetworkError] = useState(false); // Track if we're offline

  const currentUser: User = authService.getCurrentUser() || { id: 0, username: '', email: '' };

  // Load messages and subscribe to real-time updates
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    let pusherUnsubscribed = false; // Track if we already cleaned up

    // If viewing own messages, load and subscribe to messages
    if (currentUser && currentUser.username === username) {
      const loadMessages = async () => {
        try {
          setNetworkError(false); // Clear any previous network errors
          const response = await messageService.getMessages(username!);
          setMessages(response.messages || []);
        } catch (error) {
          console.error('Failed to load messages', error);
          setNetworkError(true); // Show network error state
        } finally {
          setLoading(false);
        }
      };

      loadMessages();

      const handleNewMessage = (data: Message) => {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates using unique ID
          const messageExists = prev.some(msg => msg.id === data.id);

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

      // Subscribe to Pusher after a short delay to ensure connection is ready
      const subscribeTimeout = setTimeout(() => {
        if (!pusherUnsubscribed) {
          pusherService.subscribeToIndividualMessages(username!, handleNewMessage);
        }
      }, 1500);

      // Cleanup: unsubscribe when component unmounts or username changes
      return () => {
        pusherUnsubscribed = true;
        clearTimeout(subscribeTimeout);
        pusherService.unsubscribe(`private-messages-${username}`);
      };
    } else {
      // If viewing someone else's messages, just show the form (no messages loaded)
      setLoading(false);
    }
  }, [username]);

  //Subscribe to notifications
  useEffect(() => {
    (async () => {
      if (currentUser?.id) {
        await PushNotificationService.initialize();
        await PushNotificationService.login(String(currentUser.id),
          {
            url: import.meta.env.VITE_API_BASE_URL + 'pusher/beam-auth',
            // No Authorization header needed - backend reads JWT from session cookie
            headers: {}
          })
      }
    })();

  }, [currentUser])

  const handleSend = async (message: string, files: File[]): Promise<void> => {
    try {
      // Show "Sending..." status
      setSendingMessage(true);
      setMessageSentSuccess(false);
      setNetworkError(false);

      await messageService.sendIndividualMessage(username!, message, files);

      // Show "Sent!" confirmation for 2 seconds
      setMessageSentSuccess(true);
      // Put the SentMessage component above the form after 2 seconds

      setTimeout(() => setMessageSentSuccess(false), 10000);
    } catch (err) {
      console.error('Failed to send message', err);
      setNetworkError(true); // Show network error
    } finally {
      setSendingMessage(false);
    }
  };

  // Retry loading messages if there was a network error
  const retryLoadMessages = async () => {
    setLoading(true);
    setNetworkError(false);
    try {
      const response = await messageService.getMessages(username!);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load messages', error);
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const isOwnMessages = currentUser && currentUser.username === username;

  // Define navigation items using shared common items
  const navItems = getCommonNavItems();

  if (loading) {
    return (
      <Layout navItems={navItems}>
        <div className="min-h-screen text-lk-t1 dark:text-dk-t1 relative z-10 max-w-4xl lg:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative z-10">
            <ChatScreen>
              <ChatHeader
                title={isOwnMessages ? `Your Private Messages` : `Send Message to ${username}`}
                onToggleMembers={handleLogout}
              />
              <LoadingSpinner />
            </ChatScreen>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout navItems={navItems}>
      <div className="min-h-screen text-lk-t1 dark:text-dk-t1 relative z-10 max-w-4xl lg:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative z-10">
          <ChatScreen>
            <ChatHeader
              title={isOwnMessages ? `Your Private Messages` : `Send Message to ${username}`}
              onToggleMembers={handleLogout}
            />
            {/* Message list with consistent padding */}
            <div className="grow overflow-y-auto p-6 scrollbar-hide">
              {/* Show network error with retry button */}
              {networkError && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-lk-danger-pale dark:bg-dk-danger-pale border border-lk-danger/30 dark:border-dk-danger/30 rounded-[14px] p-6 mb-6 text-center"
                >
                  <p className="text-lk-danger dark:text-dk-danger mb-3">Connection problem. Please check your internet.</p>
                  <button
                    onClick={retryLoadMessages}
                    className="bg-lk-accent dark:bg-dk-accent text-white px-6 py-2 rounded-full font-medium hover:bg-lk-accent2 dark:hover:bg-dk-accent2 transition-colors duration-300"
                  >
                    Retry
                  </button>
                </motion.div>
              )}
              {messageSentSuccess ? (
                <SentMessage />
              ) : (
                <MessageList messages={messages} currentUser={currentUser} groupType={false} />
              )}
            </div>

            {!isOwnMessages && (
              <div className="p-6 border-t border-lk-border2 dark:border-dk-border2 bg-lk-s2 dark:bg-dk-s2">
                {/* Show status message above the form */}
                {sendingMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-lk-t3 dark:text-dk-t3 mb-3 text-center"
                  >
                    Sending...
                  </motion.div>
                )}
                {messageSentSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-lk-accent2 dark:text-dk-accent mb-3 text-center"
                  >
                    ✓ Sent!
                  </motion.div>
                )}
                <MessageForm onMessageSent={handleSend} />
              </div>
            )}
          </ChatScreen>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;