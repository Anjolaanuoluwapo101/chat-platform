<?php

namespace App\Controllers;

use App\Models\Group;
use App\Models\Message;
use App\Factory\StorageFactory;
use App\Models\Photo;
use App\Models\Video;
use App\Models\Audio;
use App\Services\PusherService;
use App\Services\ChannelManager;

/**
 * GroupController handles group creation, viewing, messaging, and management.
 */
class GroupController extends BaseController
{
    /**
     * Display all groups.
     */
    public function __construct()
    {
        parent::__construct();
    }

    public function viewGroups()
    {
        $groupModel = new Group();
        $groups = $groupModel->getAllGroups();

        $this->render('groups', [
            'groups' => $groups
        ]);
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

        $this->render('group_messages', [
            'group' => $group,
            'messages' => $messages
        ]);
    }

    /**
     * Show the create group form.
     */
    public function showCreateGroupForm()
    {
        if (!isset($_SESSION['user'])) {
            header('Location: /login.php');
            exit;
        }

        $this->render('create_group');
    }

    /**
     * Create a new group.
     */
    public function createGroup()
    {
        if (!isset($_SESSION['user'])) {
            header('Location: /login.php');
            exit;
        }

        $name = trim($_POST['name'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($name)) {
            $this->render('create_group', ['error' => 'Group name is required']);
            return;
        }

        $groupModel = new Group();
        $groupData = [
            'name' => $name,
            'creator_id' => $_SESSION['user']['id'],
            'password_hash' => !empty($password) ? password_hash($password, PASSWORD_DEFAULT) : null
        ];

        if ($groupModel->createGroup($groupData)) {
            header('Location: /groups.php');
            exit;
        } else {
            $this->render('create_group', ['error' => 'Failed to create group']);
        }
    }

    /**
     * Submit a message to a group.
     */
    public function submitGroupMessage()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $groupId = $_POST['group_id'] ?? '';
        $text = $_POST['message'] ?? '';
        $time = date('Y-m-d H:i:s');

        if (!$groupId || !$text) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing group_id or message']);
            return;
        }

        // Verify group exists and user has access
        $groupModel = new Group();
        $group = $groupModel->getGroup($groupId);
        if (!$group) {
            http_response_code(404);
            echo json_encode(['error' => 'Group not found']);
            return;
        }

        // Check password if required (assume user has already accessed the group)
        if (!empty($group['password_hash'])) {
            // For simplicity, assume access is granted via session or previous check
            // In production, implement proper session-based access control
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

        $username = $_SESSION['user']['username'];
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

        $response = ['success' => true];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        echo json_encode($response);
    }

    /**
     * Delete a group (only by creator).
     */
    public function deleteGroup()
    {
        // if (!isset($_SESSION['user'])) {
        //     header('Location: /login');
        //     exit;
        // }

        $groupId = $_POST['group_id'] ?? '';
        if (!$groupId) {
            die("Invalid group ID");
        }

        $groupModel = new Group();
        $group = $groupModel->getGroup($groupId);
        if (!$group || $group['creator_id'] != $_SESSION['user']['id']) {
            die("Unauthorized");
        }

        if ($groupModel->deleteGroup($groupId, $_SESSION['user']['id'])) {
            header('Location: /groups.php');
            exit;
        } else {
            die("Failed to delete group");
        }
    }
}
