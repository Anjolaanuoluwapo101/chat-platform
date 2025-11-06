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

    public function create($name, $isAnonymous = false)
    {
        return $this->db->createGroup($name, $isAnonymous);
    }

    public function addMember($groupId, $userId)
    {
        return $this->db->addGroupMember($groupId, $userId);
    }

    public function addAdmin($groupId, $userId)
    {
        return $this->db->addAdmin($groupId, $userId);
    }


    public function isMember($groupId, $userId)
    {
        return $this->db->isUserInGroup($groupId, $userId);
    }

    public function get($groupId)
    {
        return $this->db->getGroup($groupId);
    }

    /**
     * Get all groups a user is a member of, with unread counts and last message info
     */
    public function getUserGroups($userId)
    {
        return $this->db->getUserGroups($userId);
    }

    /*
    * Get group members
    */
    public function getGroupMembers($groupId)
    {
        return $this->db->getGroupMembers($groupId);
    }

    /**
     * Get paginated messages for a group
     */
    public function getMessagesPaginated($groupId, $requestingUserId, $limit = 50, $beforeMessageId = null)
    {
        return $this->db->getGroupMessagesPaginated($groupId, $requestingUserId, $limit, $beforeMessageId);
    }

    /**
     * Mark messages as read up to a specific message
     */
    public function markMessagesRead($groupId, $userId, $lastMessageId)
    {
        return $this->db->markMessagesRead($groupId, $userId, $lastMessageId);
    }
}
