<?php

namespace App\Controllers;

use App\Models\Group;
use App\Models\Message;
use App\Factory\StorageFactory;
use App\Services\AuthService;
use App\Models\Photo;
use App\Models\Video;
use App\Models\Audio;
use App\Services\PusherService;
use App\Services\ChannelManager;
use App\Log\Logger;

/**
 * GroupController handles group creation, viewing, messaging, and management.
 */
 // Removed Backward Compability. Only accessible with JWT token and returns JSON responses
class GroupController extends BaseController
{
    private $authService;
    private $user;
    private $userId;
    private $logger;

    public function __construct()
    {
        parent::__construct();
        $this->logger = new Logger();
        // Authenticate user via JWT
        $this->authService = new AuthService();
        $this->user = $this->authService->authenticateFromToken();
        if (!$this->user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
            return;
        }
        $this->userId = $this->user['id'];
    }

    /**
     * API endpoint to get all groups for a user.
     */
    public function viewGroups()
    {
        $groupModel = new Group();
        $groups = $groupModel->getAllGroups($this->userId);

        $this->jsonResponse(['success' => true, 'groups' => $groups]);
    }

    /**
     * Display a specific group's messages.
     */
    public function viewGroupMessages()
    {
        $groupId = $_GET['id'] ?? '';
        if (!$groupId) {
            die("Invalid group ID");
        }

        $groupModel = new Group();
        $group = $groupModel->getGroup($groupId);
        if (!$group) {
            die("Group not found");
        }

        // Check if password is required
        $passwordRequired = !empty($group['password_hash']);
        $hasAccess = !$passwordRequired;

        if ($passwordRequired && isset($_POST['password'])) {
            $hasAccess = $groupModel->verifyPassword($groupId, $_POST['password']);
        }

        if (!$hasAccess) {
            $this->render('group_access', [
                'group' => $group,
                'error' => isset($_POST['password']) ? 'Incorrect password' : null
            ]);
            return;
        }

        $messageModel = new Message();
        $messages = $groupModel->getGroupMessages($groupId);

        //return messages via JSON
        $this->jsonResponse(['success' => true, 'messages' => $messages]);
    }

    /**
     * Show the create group form.
     */
    public function showCreateGroupForm()
    {
        if (isset($this->user)) {
            $this->render('create_group');
        }
    }

    /**
     * API endpoint to create a group.
     */
    public function createGroup()
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $name = trim($input['name'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($name)) {
            $this->jsonResponse(['success' => false, 'errors' => ['name' => 'Group name is required']], 400);
            return;
        }

        $groupModel = new Group();
        $groupData = [
            'name' => $name,
            'creator_id' => $this->userId,
            'password_hash' => !empty($password) ? password_hash($password, PASSWORD_DEFAULT) : null
        ];

        if ($groupModel->createGroup($groupData)) {
            $this->jsonResponse(['success' => true, 'message' => 'Group created successfully']);
        } else {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Failed to create group']], 500);
        }
    }

    /**
     * API endpoint to submit a message to a group.
     */
    public function submitGroupMessage()
    {
        $groupId = $_POST['group_id'] ?? '';
        $text = $_POST['message'] ?? '';
        $time = date('Y-m-d H:i:s');

        if (!$groupId || !$text) {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Group ID and message are required']], 400);
            return;
        }

        // Verify group exists
        $groupModel = new Group();
        $group = $groupModel->getGroup($groupId);
        if (!$group) {
            $this->jsonResponse(['error' => 'Group not found'], 404);
            return;
        }

        $messageModel = new Message();

        // Handle file uploads
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

        $username = $this->user['username'];
        $messageModel->saveMessage($username, $text, $time, $mediaUrls, $groupId);

        // Use ChannelManager to get the group channel
        $channelManager = new ChannelManager();
        $channelInfo = $channelManager->getChannel('group', $groupId);
        $channel = $channelInfo['name'];

        // Trigger Pusher event
        $pusherService = new PusherService();
        $eventData = [
            'username' => $username,
            'content' => htmlspecialchars($text),
            'created_at' => $time,
            'media_urls' => $mediaUrls
        ];
        $pusherService->triggerEvent($channel, 'new-message', $eventData);

        $response = ['success' => true, 'message' => 'Message sent to group'];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        $this->jsonResponse($response);
    }

    /**
     * API endpoint to delete a group (only by creator).
     */
    public function deleteGroup()
    {
        $groupId = $_POST['group_id'] ?? '';
        if (!$groupId) {
            $this->jsonResponse(['error' => 'Group ID parameter required'], 400);
            return;
        }

        $groupModel = new Group();
        $group = $groupModel->getGroup($groupId);
        if (!$group) {
            $this->jsonResponse(['error' => 'Group not found'], 404);
            return;
        }

        if ($group['creator_id'] != $this->userId) {
            $this->jsonResponse(['error' => 'Unauthorized'], 403);
            return;
        }

        if ($groupModel->deleteGroup($groupId, $this->userId)) {
            $this->jsonResponse(['success' => true, 'message' => 'Group deleted successfully']);
        } else {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Failed to delete group']], 500);
        }
    }
}
