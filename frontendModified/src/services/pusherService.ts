import Pusher from 'pusher-js';

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

// Pusher configuration
const pusher = new Pusher('7e136cd2a9797c421ac1', {
  cluster: 'eu',
  authEndpoint: import.meta.env.VITE_API_BASE_URL + 'pusher/auth',
  auth: {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    }
  }
});

class PusherService {
  private channels: Map<string, any>;

  constructor() {
    this.channels = new Map();
  }

  // Subscribe to individual messages channel
  subscribeToIndividualMessages(username: string, onNewMessage: (data: Message) => void) {
    const channelName = `private-messages-${username}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-message', (data: Message) => {
      onNewMessage(data);
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to group messages channel
  subscribeToGroupMessages(groupId: number, onNewMessage: (data: Message) => void) {
    const channelName = `private-group-${groupId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-message', (data: Message) => {
      onNewMessage(data);
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Unsubscribe from channel
  unsubscribe(channelName: string) {
    if (this.channels.has(channelName)) {
      pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channelName) => {
      pusher.unsubscribe(channelName);
    });
    this.channels.clear();
  }

  // Get Pusher instance
  getPusher() {
    return pusher;
  }
}

export default new PusherService();