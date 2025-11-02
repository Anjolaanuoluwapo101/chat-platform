<?php

namespace App\Traits;

use App\Services\PusherService;
use App\Services\ChannelManager;

/**
 * PusherTrait provides Pusher authentication functionality for controllers.
 */
trait PusherTrait
{
    /**
     * Authenticates users for private Pusher channels (e.g., groups).
     */
    public function authenticatePusherChannel()
    {
        // Authenticate user for private channel access
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $channelName = $_POST['channel_name'] ?? '';
        $socketId = $_POST['socket_id'] ?? '';

        if (!$channelName || !$socketId) {
            $this->jsonResponse(['error' => 'Missing channel_name or socket_id'], 400);
            return;
        }

        $channelManager = new ChannelManager();
        if (!$channelManager->isPrivateChannel($channelName)) {
            $this->jsonResponse(['error' => 'Channel is not private'], 400);
            return;
        }

        try {
            $pusherService = new PusherService();
            $authResponse = $pusherService->authenticatePrivateChannel($channelName, $socketId, $this->userId);
            echo $authResponse;
        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
