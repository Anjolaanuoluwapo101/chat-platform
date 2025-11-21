<?php

namespace App\Traits;

use App\Config\Config;
use App\Factory\DatabaseFactory;
use App\Services\PusherService;
use App\Services\ChannelManager;
use Pusher\PushNotifications\PushNotifications;

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
        // Use php://input for raw POST data
        $input = json_decode(file_get_contents('php://input'), true);
        $channelName = $input['channel_name'] ?? '';
        $socketId = $input['socket_id'] ?? '';

        if (!$channelName || !$socketId) {
            $this->jsonResponse(['error' => 'Missing channel_name or socket_id'], 400);
            return;
        }

        $channelManager = new ChannelManager();
        if (!$channelManager->isPrivateChannel($channelName)) {
            $this->jsonResponse(['error' => 'Channel is not private'], 400);
            return;
        }

        // If the private channel is a group channel, check membership before authenticating
        try {
            if (strpos($channelName, 'private-group-') === 0) {
                // channel format: private-group-<groupId>
                $parts = explode('-', $channelName);
                $groupId = end($parts);
                // Validate numeric group id
                if (!is_numeric($groupId)) {
                    $this->jsonResponse(['error' => 'Invalid group id in channel'], 400);
                    return;
                }

                $db = DatabaseFactory::createDefault();
                if (!$db->isUserInGroup((int) $groupId, $this->userId)) {
                    $this->jsonResponse(['error' => 'User is not a member of this group'], 403);
                    return;
                }
            }

            $pusherService = new PusherService();
            $authResponse = $pusherService->authenticatePrivateChannel($channelName, $socketId, $this->userId);
            return $this->jsonResponse($authResponse);
        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function authenticatePusherBeams()
    {
        try {

            // Extract user ID from request parameters
            $userId = $_GET['user_id'];
            if (!$userId)
                return $this->jsonResponse(['error' => 'User ID is required'], 400);

            // Check if user is authenticated from tokens
            $user = $this->authenticateUser();
            if (!$user) {
                $this->jsonResponse(['error' => 'Authentication required'], 401);
                return;
            }

            // Compare user ID from request with authenticated user
            if ($user['id'] != $userId)
                return $this->jsonResponse(['error' => 'User ID mismatch'], 403);


            $beamsClient = new PushNotifications([
                'instanceId' => Config::get('pusher')['beam_instance_id'],
                'secretKey' => Config::get('pusher')['beam_secret_key'],
            ]);

            $tokenData = $beamsClient->generateToken($userId);

            return $this->jsonResponse($tokenData);
        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
