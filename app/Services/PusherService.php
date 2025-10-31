<?php

namespace App\Services;

use Pusher\Pusher;
use App\Config\Config;

/**
 * PusherService handles Pusher initialization, event triggering, and authentication for private channels.
 */
class PusherService
{
    private $pusher;

    public function __construct()
    {
        $config = Config::get('pusher');
        $this->pusher = new Pusher(
            $config['key'],
            $config['secret'],
            $config['app_id'],
            [
                'cluster' => $config['cluster'],
                'encrypted' => true
            ]
        );
    }

    /**
     * Triggers an event on a specified channel.
     *
     * @param string $channel The channel name.
     * @param string $event The event name.
     * @param array $data The data to send with the event.
     * @return mixed The result of the trigger operation.
     */
    public function triggerEvent($channel, $event, $data)
    {
        return $this->pusher->trigger($channel, $event, $data);
    }

    /**
     * Authenticates a user for a private channel.
     * This method should be called from an authentication endpoint.
     *
     * @param string $channelName The private channel name.
     * @param string $socketId The socket ID from the client.
     * @param int|null $userId The user ID (optional, can be used for authorization).
     * @return string The authentication response.
     */
    public function authenticatePrivateChannel($channelName, $socketId, $userId = null)
    {
        // For now, allow all authenticated users to join private channels.
        // In the future, add logic to check if the user is authorized for the specific group.
        if (!$userId) {
            throw new \Exception('User must be authenticated to join private channels.');
        }

        return $this->pusher->authorizeChannel($channelName, $socketId);
    }

    /**
     * Gets the Pusher instance.
     *
     * @return Pusher The Pusher instance.
     */
    public function getPusher()
    {
        return $this->pusher;
    }
}
