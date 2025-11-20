<?php

namespace App\Models;

use App\Factory\DatabaseFactory;

class Group
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseFactory::createDefault();
    }

    // Group management
    public function create($name, $isAnonymous = false)
    {
        return $this->db->createGroup($name, $isAnonymous);
    }

    public function getGroupInfo($groupId)
    {
        return $this->db->getGroupInfo($groupId);
    }

    public function updateGroupSettings($groupId, $settings)
    {
        return $this->db->updateGroupSettings($groupId, $settings);
    }

    public function deleteGroup($groupId)
    {
        return $this->db->deleteGroup($groupId);
    }

    // Group membership
    public function addMember($groupId, $userId)
    {
        return $this->db->addGroupMember($groupId, $userId);
    }
    
    public function removeMember($groupId, $userId)
    {
        return $this->db->removeGroupMember($groupId, $userId);
    }

    public function isMember($groupId, $userId)
    {
        return $this->db->isUserInGroup($groupId, $userId);
    }

    public function getGroupMembers($groupId)
    {
        return $this->db->getGroupMembers($groupId);
    }

    // Group admin operations
    public function addAdmin($groupId, $userId)
    {
        return $this->db->addAdmin($groupId, $userId);
    }

    public function removeAdmin($groupId, $userId)
    {
        return $this->db->removeAdmin($groupId, $userId);
    }

    public function isAdmin($groupId, $userId)
    {
        return $this->db->isAdmin($groupId, $userId);
    }

    public function getGroupAdmins($groupId)
    {
        return $this->db->getGroupAdmins($groupId);
    }

    public function promoteToAdmin($groupId, $userId)
    {
        return $this->addAdmin($groupId, $userId);
    }

    public function demoteAdmin($groupId, $userId)
    {
        return $this->removeAdmin($groupId, $userId);
    }

    // Group moderation
    public function banUser($groupId, $userId)
    {
        return $this->db->banUser($groupId, $userId);
    }

    public function unbanUser($groupId, $userId)
    {
        return $this->db->unbanUser($groupId, $userId);
    }

    public function getBannedUsers($groupId)
    {
        return $this->db->getBannedUsers($groupId);
    }

    // Group messaging
    /**
     * Get all groups a user is a member of, with unread counts and last message info
     */
    public function getUserGroups($userId)
    {
        return $this->db->getUserGroups($userId);
    }

    /**
     * Get paginated messages for a group
     */
    public function getMessagesPaginated($groupId, $limit = 50, $beforeMessageId = null, $direction = 'before' )
    {
        return $this->db->getGroupMessagesPaginated($groupId, $limit, $beforeMessageId, $direction);
    }

    public function getMessageById($messageId, $groupId)
    {
        return $this->db->getMessageById($messageId, $groupId);
    }

    /**
     * Mark messages as read up to a specific message
     */
    public function markMessagesRead($groupId, $userId, $lastMessageId)
    {
        return $this->db->markMessagesRead($groupId, $userId, $lastMessageId);
    }

    public function getLastReadMessageId($groupId, $userId)
    {
        return $this->db->getLastReadMessageId($groupId, $userId);
    }

    /**
     * Get user by username
     */
    public function getUser($username)
    {
        return $this->db->getUser($username);
    }
}