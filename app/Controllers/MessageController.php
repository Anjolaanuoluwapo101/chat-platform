<?php

namespace App\Controllers;

use App\Models\Message;
use App\Factory\StorageFactory;
use App\Services\AuthService;
use App\Models\Photo;
use App\Models\Video;
use App\Models\Audio;
use App\Services\PusherService;
use App\Services\ChannelManager;
use App\Log\Logger;
use App\Traits\PusherTrait;

/**
 * MessageController handles message viewing, submission, and Pusher authentication.
 */
class MessageController extends BaseController
{
    use PusherTrait;
    private $authService;
    private $user;
    private $userId;
    private $logger;

    public function __construct()
    {
        parent::__construct();
        $this->logger = new Logger();
        $this->authService = new AuthService();
    }

    /**
     * Authenticate user and set user properties.
     * Call this in methods that require authentication.
     */
    protected function authenticateUser()
    {
        if (!$this->user) {
            $this->user = $this->authService->authenticateFromToken();
            if ($this->user) {
                $this->userId = $this->user['id'];
            }
        }
        return $this->user;
    }

    /**
     * API endpoint to get messages for a username.
     */
    public function viewMessages()
    {
        // Authenticate user for viewing messages
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        // Support either username (individual) or group_id (group messages)
        $groupId = isset($_GET['group_id']) ? intval($_GET['group_id']) : null;
        $username = $_GET['q'] ?? '';

        $messageModel = new Message();

        if ($groupId) {
            // Fetch group messages only if requesting user is member (db layer enforces this)
            $messages = $messageModel->getGroupMessages($groupId, $this->userId);
            $this->jsonResponse([
                'success' => true,
                'messages' => $messages,
                'isOwner' => false,
                'group_id' => $groupId
            ]);
            return;
        }

        if (!$username) {
            $this->jsonResponse(['error' => 'Username parameter required'], 400);
            return;
        }

        $messages = $messageModel->getMessages($username);
        $isOwner = $username === $this->user['username'];

        $this->jsonResponse([
            'success' => true,
            'messages' => $messages,
            'isOwner' => $isOwner
        ]);
    }

    /**
     * API endpoint to submit a new message.
     * Supports both individual and group messages.
     */
    public function submitMessage()
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $username = $input['username'] ?? '';
        $text = $input['message'] ?? '';
        $type = $input['type'] ?? 'individual'; // 'individual' or 'group'
        $time = date('Y-m-d H:i:s');

        if (!$username || !$text) {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Username and message are required']], 400);
            return;
        }

        // Validate type
        if (!in_array($type, ['individual', 'group'])) {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Invalid message type']], 400);
            return;
        }

        $messageModel = new Message();

        $groupId = null;
        if ($type === 'group') {
            // require authentication for group messaging
            $user = $this->authenticateUser();
            if (!$user) {
                $this->jsonResponse(['error' => 'Authentication required for group messages'], 401);
                return;
            }
            $groupId = isset($input['group_id']) ? intval($input['group_id']) : null;
            if (!$groupId) {
                $this->jsonResponse(['success' => false, 'errors' => ['general' => 'group_id required for group messages']], 400);
                return;
            }
        }

        // Handle file uploads (if any, via multipart/form-data)
        $storage = StorageFactory::create('local');
        $mediaUrls = [];
        $errors = [];

        if (isset($_FILES['media']) && is_array($_FILES['media']['name'])) {
            $files = $_FILES['media'];
            $fileCount = count($files['name']);

            for ($i = 0; $i < $fileCount; $i++) {
                $file = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i],
                ];

                if ($file['error'] === 0) {
                    $mediaUrl = $storage->store($file);
                    if ($mediaUrl) {
                        $mediaUrls[] = $mediaUrl;
                    } else {
                        $errors[] = 'Failed to store media file: ' . $file['name'];
                    }
                } else {
                    $errors[] = 'Upload error for ' . $file['name'] . ': ' . $file['error'];
                }
            }
        }

    $messageModel->saveMessage($username, $text, $time, $mediaUrls, $groupId);

    // Use ChannelManager to get the appropriate channel
    $channelManager = new ChannelManager();
    $identifier = $type === 'group' ? $groupId : $username;
    $channelInfo = $channelManager->getChannel($type, $identifier);
        $channel = $channelInfo['name'];

        // Trigger Pusher event for real-time updates
        $pusherService = new PusherService();
        $eventData = [
            'username' => $username,
            'content' => htmlspecialchars($text),
            'created_at' => $time,
            'media_urls' => $mediaUrls,
            'type' => $type
        ];
        $pusherService->triggerEvent($channel, 'new-message', $eventData);

        $response = [
            'success' => true,
            'message' => 'Message sent',
            'channel' => $channel,
            'is_private' => $channelInfo['isPrivate']
        ];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        $this->jsonResponse($response);
    }


}
