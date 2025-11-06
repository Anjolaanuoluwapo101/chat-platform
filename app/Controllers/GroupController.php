<?php

namespace App\Controllers;

use App\Models\Group;
use App\Models\Message;
use App\Factory\StorageFactory;
use App\Services\AuthService;
use App\Services\PusherService;
use App\Services\ChannelManager;
use App\Log\Logger;
use App\Traits\PusherTrait;

class GroupController extends BaseController
{
    use PusherTrait;
    private $groupModel;
    private $logger;
    private $authService;
    private $user;
    private $userId;

    public function __construct()
    {
        parent::__construct();
        $this->groupModel = new Group();
        $this->logger = new Logger();
        $this->authService = new AuthService();
    }

    protected function authenticateUser()
    {
        if (!isset($this->authService)) {
            $this->authService = new \App\Services\AuthService();
        }
        $user = $this->authService->authenticateFromToken();
        if ($user) {
            $this->user = $user;
            $this->userId = $user['id'];
        }
        return $user;
    }

    public function createGroup()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? '';
        $isAnonymous = $input['is_anonymous'] ?? true;

        if (!$name) {
            $this->jsonResponse(['success' => false, 'error' => 'Group name required'], 400);
            return;
        }

        $groupId = $this->groupModel->create($name, $isAnonymous);
        if ($groupId) {
            // add creator as member and admin(admin table not made for sqlite yet)
            $this->groupModel->addMember($groupId, $user['id']);
            $this->groupModel->addAdmin($groupId, $user['id']);
            $this->jsonResponse(['success' => true, 'group_id' => $groupId]);
        } else {
            $this->jsonResponse(['success' => false, 'error' => 'Failed to create group'], 500);
        }
    }

    public function joinGroup()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $groupId = isset($input['group_id']) ? intval($input['group_id']) : 0;
        if (!$groupId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id required'], 400);
            return;
        }

        $added = $this->groupModel->addMember($groupId, $user['id']);
        if ($added) {
            $this->jsonResponse(['success' => true], 200);
        } else {
            $this->jsonResponse(['success' => false, 'error' => 'Failed to join group'], 500);
        }
    }

    public function getInfo()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $groupId = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;
        if (!$groupId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id required'], 400);
            return;
        }

        $group = $this->groupModel->get($groupId);
        $isMember = $this->groupModel->isMember($groupId, $user['id']);

        $this->jsonResponse(['success' => true, 'group' => $group, 'is_member' => (bool)$isMember]);
    }

    /**
     * Get all groups the authenticated user is a member of
     */
    public function getUserGroups()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $groups = $this->groupModel->getUserGroups($user['id']);
        $this->jsonResponse(['success' => true, 'groups' => $groups]);
    }

    /*
    *Get the members of a group
    */
    public function getGroupMembers()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }
        $groupId = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;
        if (!$groupId) {
            $this->jsonResponse(['error' => 'group_id required'], 400);
            return;
        }
        $members = $this->groupModel->getGroupMembers($groupId);
        $this->jsonResponse(['success' => true, 'members' => $members]);
    }

        
    /**
     * Get paginated messages for a group
     */
    public function viewMessages()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $groupId = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;
        $beforeId = isset($_GET['before_id']) ? intval($_GET['before_id']) : null;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 50;

        if (!$groupId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id required'], 400);
            return;
        }

        // Check membership
        if (!$this->groupModel->isMember($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Not a member of this group'], 403);
            return;
        }

        $messages = $this->groupModel->getMessagesPaginated($groupId, $user['id'], $limit, $beforeId);
        $this->jsonResponse(['success' => true, 'messages' => $messages]);
    }

    /**
     * Mark messages as read up to a specific message
     */
    public function markRead()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        // $input = $_POST;
        $groupId = isset($input['group_id']) ? intval($input['group_id']) : 0;
        $lastMessageId = isset($input['last_message_id']) ? intval($input['last_message_id']) : 0;

        if (!$groupId || !$lastMessageId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id and last_message_id required'], 400);
            return;
        }

        // Check membership
        if (!$this->groupModel->isMember($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Not a member of this group'], 403);
            return;
        }

        $updated = $this->groupModel->markMessagesRead($groupId, $user['id'], $lastMessageId);
        $this->jsonResponse(['success' => $updated]);
    }

    /**
     * Submit a new message to a group
     */
    public function submitMessage()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        // Get POST data
        $content = $_POST['content'] ?? '';
        $groupId = isset($_POST['group_id']) ? intval($_POST['group_id']) : 0;
        $time = date('Y-m-d H:i:s');

        if (!$content || !$groupId) {
            $this->jsonResponse(['success' => false, 'error' => 'content and group_id required'], 400);
            return;
        }

        // Check group membership
        if (!$this->groupModel->isMember($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Not a member of this group'], 403);
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

        $messageId = $messageModel->saveMessage($user['username'], $content, $time, $mediaUrls, $groupId);

        // Use ChannelManager to get the appropriate channel
        $channelManager = new ChannelManager();
        $identifier = $groupId;
        $channelInfo = $channelManager->getChannel('group', $identifier);
        $channel = $channelInfo['name'];

        // Trigger Pusher event for real-time updates
        $pusherService = new PusherService();
        $eventData = [
            'username' => $user['username'],
            'content' => htmlspecialchars($content),
            'created_at' => $time,
            'media_urls' => $mediaUrls,
            'id' => $messageId
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
