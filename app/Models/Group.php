<?php

namespace App\Models;

use App\Factory\DatabaseFactory;
use App\Log\Logger;

/**
 * Group model for handling group-related database operations.
 */
class Group
{
    private $db;
    private $logger;

    public function __construct()
    {
        $this->logger = new Logger;
        $this->db = DatabaseFactory::create('sqlite');
    }

    /**
     * Get a group by ID.
     *
     * @param int $groupId
     * @return array|null
     */
    public function getGroup($groupId)
    {
        return $this->db->getGroup($groupId);
    }

    /**
     * Get all groups.
     *
     * @return array
     */
    public function getAllGroups($userId)
    {
        return $this->db->getAllGroups($groupId);
    }

    /**
     * Create a new group.
     *
     * @param array $groupData
     * @return bool
     */
    public function createGroup($groupData)
    {
        try {
            return $this->db->saveGroup($groupData);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());
            return false;
        }
    }

    /**
     * Delete a group (only by creator).
     *
     * @param int $groupId
     * @param int $creatorId
     * @return bool
     */
    public function deleteGroup($groupId, $creatorId)
    {
        try {
            return $this->db->deleteGroup($groupId, $creatorId);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());
            return false;
        }
    }

    /**
     * Get messages for a group.
     *
     * @param int $groupId
     * @return array
     */
    public function getGroupMessages($groupId)
    {
        return $this->db->getGroupMessages($groupId);
    }

    /**
     * Verify group password.
     *
     * @param int $groupId
     * @param string $password
     * @return bool
     */
    public function verifyPassword($groupId, $password)
    {
        $group = $this->getGroup($groupId);
        if (!$group || !$group['password_hash']) {
            return true; // No password required
        }
        return password_verify($password, $group['password_hash']);
    }
}
