<?php

namespace App\Controllers;

use App\Models\Message;
use App\Factory\StorageFactory;
use App\Models\Photo;
use App\Models\Video;
use App\Models\Audio;
use App\Services\PusherService;
use App\Services\ChannelManager;

/**
 * MessageController handles message viewing, submission, and Pusher authentication.
 */
class MessageController extends BaseController
{
    /**
     * Displays messages for a given username.
     */
    public function viewMessages()
    {
        $username = $_GET['q'] ?? '';
        if (!$username) {
           die("Invalid URL");
        }

        $messageModel = new Message();
        $messages = $messageModel->getMessages($username);
        

        $isOwner = isset($_SESSION['user']) && $username == $_SESSION['user']['username'];

        $this->render('messages', [
            'messages' => $messages,
            'isOwner' => $isOwner,
            'username' => $username
        ]);
    }

    /**
     * Alias for viewMessages.
     */
    public function showMessages()
    {
        $this->viewMessages();
    }

    /**
     * Submits a new message and triggers real-time update.
     */
    public function submitMessage()
    {
        header('Content-Type: application/json');
        $username = $_POST['username'] ?? '';
        $text = $_POST['message'] ?? '';
        $time = date('Y-m-d H:i:s');

        $messageModel = new Message();

        // Handle file uploads first
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
        $channelInfo = $channelManager->getChannel('individual', $username);
        $channel = $channelInfo['name'];

        // Trigger Pusher event for real-time updates
        $pusherService = new PusherService();
        $eventData = [
            'username' => $username,
            'content' => htmlspecialchars($text),
            'created_at' => $time,
            'media_urls' => $mediaUrls
        ];
        $pusherService->triggerEvent($channel, 'new-message', $eventData);

        $response = ['success' => true];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        echo json_encode($response);
    }

    /**
     * Authenticates users for private Pusher channels (e.g., groups).
     * This endpoint is called by Pusher client-side library for private channel auth.
     */
    public function authenticatePusher()
    {
        header('Content-Type: application/json');

        // Check if user is logged in
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $channelName = $_POST['channel_name'] ?? '';
        $socketId = $_POST['socket_id'] ?? '';

        if (!$channelName || !$socketId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing channel_name or socket_id']);
            return;
        }

        $channelManager = new ChannelManager();
        if (!$channelManager->isPrivateChannel($channelName)) {
            http_response_code(400);
            echo json_encode(['error' => 'Channel is not private']);
            return;
        }

        try {
            $pusherService = new PusherService();
            $userId = $_SESSION['user']['id'] ?? null; // Assuming user ID is stored in session
            $authResponse = $pusherService->authenticatePrivateChannel($channelName, $socketId, $userId);
            echo $authResponse;
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
