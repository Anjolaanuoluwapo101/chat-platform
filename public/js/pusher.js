/**
 * MessagePusher class handles real-time messaging via Pusher for both individual and group messages.
 * Supports public channels (individuals) and private channels (groups) with authentication.
 */
class MessagePusher {
    constructor(pusherKey, cluster, authEndpoint = '/authenticate-pusher.php') {
        this.pusher = new Pusher(pusherKey, {
            cluster: cluster,
            authEndpoint: authEndpoint // Endpoint for private channel authentication
        });
        this.username = this.getUsernameFromURL();
        this.channel = null;
        this.channelType = 'individual'; // Default to individual; can be set to 'group' for groups
        this.identifier = this.username; // For groups, this would be groupId
    }

    /**
     * Extracts username from URL query parameter.
     */
    getUsernameFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('q');
    }

    /**
     * Sets the channel type and identifier for subscription.
     * @param {string} type - 'individual' or 'group'
     * @param {string} identifier - username for individual, groupId for group
     */
    setChannel(type, identifier) {
        this.channelType = type;
        this.identifier = identifier;
    }

    /**
     * Subscribes to the appropriate channel based on type.
     */
    subscribeToChannel() {
        if (!this.identifier) {
            console.error('No identifier found');
            return;
        }

        let channelName;
        if (this.channelType === 'individual') {
            channelName = 'messages-' + this.identifier;
        } else if (this.channelType === 'group') {
            channelName = 'private-group-' + this.identifier;
        } else {
            console.error('Invalid channel type');
            return;
        }

        this.channel = this.pusher.subscribe(channelName);
        this.bindEvents();
    }

    /**
     * Binds event listeners for the channel.
     */
    bindEvents() {
        this.channel.bind('new-message', (data) => {
            this.handleNewMessage(data);
        });

        // Handle subscription errors (e.g., auth failure for private channels)
        this.channel.bind('pusher:subscription_error', (status) => {
            console.error('Subscription error:', status);
        });
    }

    /**
     * Handles incoming new message events.
     */
    handleNewMessage(data) {
        console.log(JSON.stringify(data));

        // Check if message already exists to prevent duplicates
        const existingMessages = document.querySelectorAll('.messageDiv');
        let messageExists = false;

        existingMessages.forEach((msgDiv) => {
            const timeDiv = msgDiv.querySelector('.timeDiv');
            if (timeDiv && timeDiv.textContent.trim().includes(data.created_at.trim())) {
                messageExists = true;
                console.log('Message already exists');
            }
        });

        if (!messageExists) {
            this.renderMessage(data);
        }
    }

    /**
     * Renders a new message in the UI.
     */
    renderMessage(data) {
        // Create new message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'messageDiv';

        const textDiv = document.createElement('div');
        textDiv.className = 'textDiv';
        textDiv.innerHTML = data.content;

        try {
            // Add media if present
            if (data.media_urls && data.media_urls.length > 0) {
                data.media_urls.forEach((mediaUrl) => {
                    this.addMediaElement(textDiv, mediaUrl);
                });
            }
        } catch (error) {
            console.error('Error adding media:', error);
        }

        const timeDiv = document.createElement('div');
        timeDiv.className = 'timeDiv';
        timeDiv.textContent = 'Sent on ' + data.created_at;

        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timeDiv);

        // Add to the page
        const parentDiv = document.querySelector('.parentDiv');
        parentDiv.appendChild(messageDiv);
    }

    /**
     * Adds media elements (images, videos, audio) to the message container.
     */
    addMediaElement(container, mediaUrl) {
        let element;

        if (mediaUrl.includes('.jpg') || mediaUrl.includes('.png') || mediaUrl.includes('.gif')) {
            element = document.createElement('img');
            element.src = mediaUrl;
            element.style.maxWidth = '200px';
            element.alt = 'Photo';
        } else if (mediaUrl.includes('.mp4') || mediaUrl.includes('.webm')) {
            element = document.createElement('video');
            element.src = mediaUrl;
            element.style.maxWidth = '200px';
            element.controls = true;
        } else if (mediaUrl.includes('.mp3') || mediaUrl.includes('.wav')) {
            element = document.createElement('audio');
            element.src = mediaUrl;
            element.controls = true;
        }

        if (element) {
            container.appendChild(element);
        }
    }

    /**
     * Disconnects from Pusher and unsubscribes from the channel.
     */
    disconnect() {
        if (this.channel) {
            this.pusher.unsubscribe(this.channel.name);
        }
        this.pusher.disconnect();
    }
}

// Note: MessagePusher is now initialized in the view files (messages.php and group_messages.php)
// to allow for proper channel type and identifier configuration.
