<?php


namespace App\Traits;

use PDO;
use PDOException;

trait DatabaseGroupTrait
{

    /**
     * Create a new group.
     *
     * @param string $name
     * @param bool $isAnonymous
     * @return int|false Group id or false on failure
     */
    public function createGroup($name, $isAnonymous = true)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO groups (name, is_anonymous, updated_at) VALUES (?, ?, datetime('now'))");
            if ($stmt->execute([$name, $isAnonymous ? 1 : 0])) {
                return (int)$this->pdo->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Add a user to a group (idempotent).
     */
    public function addGroupMember($groupId, $userId)
    {
        try {
            // Check exists
            $stmt = $this->pdo->prepare("SELECT id FROM group_members WHERE group_id = ? AND user_id = ?");
            $stmt->execute([$groupId, $userId]);
            if ($stmt->fetch(PDO::FETCH_ASSOC)) {
                return true;
            }

            $stmt = $this->pdo->prepare("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)");
            return $stmt->execute([$groupId, $userId]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Returns true if user is a member of group.
     */
    public function isUserInGroup($groupId, $userId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT id FROM group_members WHERE group_id = ? AND user_id = ?");
            $stmt->execute([$groupId, $userId]);
            return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }



    /**
     * Get group row by id.
     */
    public function getGroup($groupId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM groups WHERE id = ?");
            $stmt->execute([$groupId]);
            $group = $stmt->fetch(PDO::FETCH_ASSOC);
            return $group ?: null;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }


}