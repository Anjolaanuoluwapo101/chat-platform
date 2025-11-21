<?php

namespace App\Services;

/**
 * ChannelManager handles channel naming and type determination for Pusher.
 * Supports both public channels (for individual messages) and private channels (for groups).
 */
class ChannelManager
{
    /**
     * Determines the channel name and type based on context.
     *
     * @param string $type The type of channel ('individual' or 'group').
     * @param string $identifier The identifier (username for individual, groupId for group).
     * @return array Returns an array with 'name' and 'isPrivate' keys.
     */
    public function getChannel($type, $identifier)
    {
        switch ($type) {
            case 'individual':
                return [
                    'name' => 'private-messages-' . $identifier,
                    'isPrivate' => true
                ];
            case 'group':
                return [
                    'name' => 'private-group-' . $identifier,
                    'isPrivate' => true
                ];
            default:
                throw new \InvalidArgumentException("Invalid channel type: $type");
        }
    }

    /**
     * Checks if a channel is private based on its name.
     *
     * @param string $channelName The channel name.
     * @return bool True if private, false otherwise.
     */
    public function isPrivateChannel($channelName)
    {
        return strpos($channelName, 'private-') === 0;
    }

    public function isGroupChannel($channelName)
    {
        return strpos($channelName, 'private-group-') === 0;
    }
}
