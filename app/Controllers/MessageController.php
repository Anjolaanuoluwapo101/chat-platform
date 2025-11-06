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


        $username = $_GET['username'] ?? '';

        $messageModel = new Message();

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
        //$input = json_decode(file_get_contents('php://input'), true);
        $input = $_POST;

        $username = $input['username'] ?? ''; //receiver of the message not the sender ...okayyyyy
        $text = $input['content'] ?? '';
        $time = date('Y-m-d H:i:s');

        if (!$username || !$text) {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Username and message are required']], 400);
            return;
        }

        $messageModel = new Message();

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

        $messageModel->saveMessage($username, $text, $time, $mediaUrls);

        // Use ChannelManager to get the appropriate channel
        $channelManager = new ChannelManager();
        $identifier = $username;
        $channelInfo = $channelManager->getChannel('individual', $identifier);
        $channel = $channelInfo['name'];

        // Trigger Pusher event for real-time updates
        $pusherService = new PusherService();
        $eventData = [
            'username' => $username,  //the username here is the receiver of the message
            'content' => htmlspecialchars($text),
            'created_at' => $time,
            'media_urls' => $mediaUrls
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
