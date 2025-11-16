import Pusher from 'pusher-js';

// Pusher configuration
const pusher = new Pusher('7e136cd2a9797c421ac1', {
  cluster: 'eu',
  encrypted: true,
  authEndpoint: import.meta.env.VITE_API_BASE_URL + 'pusher/auth',
  auth: {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    }
  }
});

class PusherService {
  constructor() {
    this.channels = new Map();
  }

  // Subscribe to individual messages channel
  async subscribeToIndividualMessages(username, onNewMessage) {
    const channelName = `private-messages-${username}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-message', (data) => {
      alert(data);
      onNewMessage(data);

    });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to group messages channel
  subscribeToGroupMessages(groupId, onNewMessage) {
    const channelName = `private-group-${groupId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-message', (data) => {
      onNewMessage(data);
    });

    this.channels.set(channelName, channel);
    return channel;
  }


  // Unsubscribe from channel
  unsubscribe(channelName) {
    if (this.channels.has(channelName)) {
      pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel, channelName) => {
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
