<?php

namespace App\Controllers;

use App\Models\Group;
use App\Models\Message;
use App\Factory\StorageFactory;
use App\Factory\DatabaseFactory;
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
            $this->authService = new AuthService();
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

    public function getGroupInfo()
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

        $isMember = $this->groupModel->isMember($groupId, $user['id']);
        if(!$isMember){
            return $this->jsonResponse(['success' => false,'is_member' => false]);
        }
        $group = $this->groupModel->getGroupInfo($groupId);

        // If user is an admin, and it is an non anonymous group - include additional info
        if ($this->groupModel->isAdmin($groupId, $user['id']) && !$group['is_anonymous']) {
            $group['admins'] = $this->groupModel->getGroupAdmins($groupId);
            $group['banned_users'] = $this->groupModel->getBannedUsers($groupId);
            $group['members'] = $this->groupModel->getGroupMembers($groupId);
        }
        //If user is a member  and it is a non anonymous group - include additional info
        if ($isMember && !$group['is_anonymous']) {
            $group['admins'] = $this->groupModel->getGroupAdmins($groupId);
            $group['members'] = $this->groupModel->getGroupMembers($groupId);
        }

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

    /**
     * Get the members of a group with ID and username
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
        
        // Check if user is a member of the group
        if (!$this->groupModel->isMember($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Not a member of this group'], 403);
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
        $referenceId = isset($_GET['reference_id']) ? intval($_GET['reference_id']) : null;
        $direction = isset($_GET['direction']) ? $_GET['direction'] : 'before';
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

        // Implement "around last_read" two-query strategy
        $anchorMessageId = null;

        if (!$referenceId) {
            $lastReadId = $this->groupModel->getLastReadMessageId($groupId, $user['id']);

            if (!$lastReadId) {
                // Scenario 1: No last_read_id → latest messages
                $messages = $this->groupModel->getMessagesPaginated($groupId, $$limit, null, 'before');
                $this->jsonResponse(['success' => true, 'messages' => $messages]);
                return;
            }

            // Scenario 2: With last_read_id → load after-first then fill before if needed
            $anchorMessageId = (int)$lastReadId;

            $after = $this->groupModel->getMessagesPaginated($groupId,  $limit, $lastReadId, 'after');
            $countAfter = is_array($after) ? count($after) : 0;

            if ($countAfter < $limit) {
                $need = $limit - $countAfter;
                $before = $this->groupModel->getMessagesPaginated($groupId,  $need, $lastReadId, 'before');
                $combined = array_merge($before ?: [], $after ?: []);
                $this->jsonResponse(['success' => true, 'messages' => $combined, 'anchor_message_id' => $anchorMessageId, "scrollTo" => $anchorMessageId ]);
                return;
            } else {
                $this->jsonResponse(['success' => true, 'messages' => $after, 'anchor_message_id' => $anchorMessageId, "scrollTo" => $anchorMessageId]);
                return;
            }
        }

        // Scenario 3: Explicit pagination upwards from oldest visible
        $messages = $this->groupModel->getMessagesPaginated($groupId,  $limit, $referenceId, 'before');
        $this->jsonResponse(['success' => true, 'messages' => $messages, "scrollTo" => $referenceId]);
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
     * Remove an admin from a group
     */
    public function removeAdmin()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $groupId = isset($input['group_id']) ? intval($input['group_id']) : 0;
        $userId = isset($input['user_id']) ? intval($input['user_id']) : 0;

        if (!$groupId || !$userId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id and user_id required'], 400);
            return;
        }

        // Check if current user is an admin
        if (!$this->groupModel->isAdmin($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Admin privileges required'], 403);
            return;
        }

        $removed = $this->groupModel->removeAdmin($groupId, $userId);
        $this->jsonResponse(['success' => $removed]);
    }

    /**
     * Check if a user is an admin
     */
    public function isAdmin()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $groupId = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

        if (!$groupId || !$userId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id and user_id required'], 400);
            return;
        }

        $isAdmin = $this->groupModel->isAdmin($groupId, $userId);
        $this->jsonResponse(['success' => true, 'is_admin' => $isAdmin]);
    }

    /**
     * Get all admins of a group
     */
    public function getGroupAdmins()
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

        // Check membership
        if (!$this->groupModel->isMember($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Not a member of this group'], 403);
            return;
        }

        $admins = $this->groupModel->getGroupAdmins($groupId);
        $this->jsonResponse(['success' => true, 'admins' => $admins]);
    }

    /**
     * Update group settings
     */
    public function updateGroupSettings()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $groupId = isset($input['group_id']) ? intval($input['group_id']) : 0;
        $settings = isset($input['settings']) ? $input['settings'] : [];

        if (!$groupId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id required'], 400);
            return;
        }

        // Check if current user is an admin
        if (!$this->groupModel->isAdmin($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Admin privileges required'], 403);
            return;
        }

        $updated = $this->groupModel->updateGroupSettings($groupId, $settings);
        $this->jsonResponse(['success' => $updated]);
    }

    /**
     * Delete a group
     */
    public function deleteGroup()
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

        // Check if current user is an admin
        if (!$this->groupModel->isAdmin($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Admin privileges required'], 403);
            return;
        }

        $deleted = $this->groupModel->deleteGroup($groupId);
        $this->jsonResponse(['success' => $deleted]);
    }

    /**
     * Ban a user from a group
     */
    public function banUser()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $groupId = isset($input['group_id']) ? intval($input['group_id']) : 0;
        $userId = isset($input['user_id']) ? intval($input['user_id']) : 0;

        if (!$groupId || !$userId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id and user_id required'], 400);
            return;
        }

        // Check if current user is an admin
        if (!$this->groupModel->isAdmin($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Admin privileges required'], 403);
            return;
        }

        $banned = $this->groupModel->banUser($groupId, $userId);
        $this->jsonResponse(['success' => $banned]);
    }

    /**
     * Unban a user from a group
     */
    public function unbanUser()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $groupId = isset($input['group_id']) ? intval($input['group_id']) : 0;
        $userId = isset($input['user_id']) ? intval($input['user_id']) : 0;

        if (!$groupId || !$userId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id and user_id required'], 400);
            return;
        }

        // Check if current user is an admin
        if (!$this->groupModel->isAdmin($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Admin privileges required'], 403);
            return;
        }

        $unbanned = $this->groupModel->unbanUser($groupId, $userId);
        $this->jsonResponse(['success' => $unbanned]);
    }

    /**
     * Promote a member to admin
     */
    public function promoteToAdmin()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $groupId = isset($input['group_id']) ? intval($input['group_id']) : 0;
        $userId = isset($input['user_id']) ? intval($input['user_id']) : 0;

        if (!$groupId || !$userId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id and user_id required'], 400);
            return;
        }

        // Check if current user is an admin
        if (!$this->groupModel->isAdmin($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Admin privileges required'], 403);
            return;
        }

        $promoted = $this->groupModel->promoteToAdmin($groupId, $userId);
        $this->jsonResponse(['success' => $promoted]);
    }

    /**
     * Demote an admin to member
     */
    public function demoteAdmin()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $groupId = isset($input['group_id']) ? intval($input['group_id']) : 0;
        $userId = isset($input['user_id']) ? intval($input['user_id']) : 0;

        if (!$groupId || !$userId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id and user_id required'], 400);
            return;
        }

        // Check if current user is an admin
        if (!$this->groupModel->isAdmin($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Admin privileges required'], 403);
            return;
        }

        // Cannot demote yourself
        if ($user['id'] == $userId) {
            $this->jsonResponse(['success' => false, 'error' => 'Cannot demote yourself'], 400);
            return;
        }

        $demoted = $this->groupModel->demoteAdmin($groupId, $userId);
        $this->jsonResponse(['success' => $demoted]);
    }

    /**
     * Get banned users from a group
     */
    public function getBannedUsers()
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

        // Check if current user is an admin
        if (!$this->groupModel->isAdmin($groupId, $user['id'])) {
            $this->jsonResponse(['error' => 'Admin privileges required'], 403);
            return;
        }

        $bannedUsers = $this->groupModel->getBannedUsers($groupId);
        $this->jsonResponse(['success' => true, 'banned_users' => $bannedUsers]);
    }

    /**
     * Submit a new message to a group
     * Current implementation, messages are not saved to the RDBMS just redis
     */
    public function submitMessage()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = $_POST;
        $content = $input['content'] ?? '';
        $groupId = $input['group_id'] ?? null;
        $replyToMessageId = $input['reply_to_message_id'] ?? null;
        $time = date('c'); // ISO 8601 format

        if (!$content || !$groupId) {
            $this->jsonResponse(['success' => false, 'error' => 'Content and group_id are required'], 400);
            return;
        }

        // Validate group membership
        if (!$this->groupModel->isMember($groupId, $user['id'])) {
            $this->jsonResponse(['success' => false, 'error' => 'Not a member of this group'], 403);
            return;
        }

        // Validate reply_to_message_id if provided
        // Skip checks
        // if ($replyToMessageId) {
        //     if (!$this->groupModel->isMessageInGroup($replyToMessageId, $groupId)) {
        //         $this->jsonResponse(['success' => false, 'error' => 'Invalid reply_to_message_id'], 400);
        //         return;
        //     }
        // }

        $messageModel = new Message();

        // Handle file uploads using the base class method
        $fileProcessingResult = $this->processUploadedFiles();
        $mediaUrls = $fileProcessingResult['mediaUrls'];
        $errors = $fileProcessingResult['errors'];

        // If this is a reply, fetch the parent message data
        $parentMessageData = null;
        if ($replyToMessageId) {
            $db = DatabaseFactory::createDefault();
            $parentMessage = $db->getMessageById($replyToMessageId, $groupId);
            var_dump($parentMessage);
            if ($parentMessage) {
                $parentMessageData = [
                    'username' => $parentMessage['username'] ?? 'Anonymous',
                    'content' => $parentMessage['content'] ?? '',
                    'created_at' => $parentMessage['created_at'],
                    'media_urls' => $parentMessage['media_urls'] ?? []
                ];
            }
        }
        
        $messageId = $messageModel->saveMessage($user['username'], $content, $time, $mediaUrls,$parentMessageData, $groupId, $replyToMessageId);

        // Handle Pusher event
        $pusherResult = $this->handlePusherEvent($user, $content, $time, $mediaUrls, $messageId, $groupId, $replyToMessageId, $parentMessageData);
        $channel = $pusherResult['channel'];
        $channelInfo = $pusherResult['channelInfo'];

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

    /**
     * Handle Pusher event for real-time updates
     */
    private function handlePusherEvent($user, $content, $time, $mediaUrls, $messageId, $groupId, $replyToMessageId, $parentMessageData = null)
    {
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
            'id' => $messageId,
            'reply_to_message_id' => $replyToMessageId
        ];
        
        // If this is a reply, include the parent message data
        if ($replyToMessageId && $parentMessageData) {
            $eventData['replied_message_username'] = $parentMessageData['username'];
            $eventData['replied_message_content'] = $parentMessageData['content'];
            $eventData['replied_message_created_at'] = $parentMessageData['created_at'];
            // Include media URLs if available
            if (!empty($parentMessageData['media_urls'])) {
                $eventData['replied_message_media_urls'] = $parentMessageData['media_urls'];
            }
        }
        
        $pusherService->triggerEvent($channel, 'new-message', $eventData);

        return [
            'channel' => $channel,
            'channelInfo' => $channelInfo
        ];
    }

}
