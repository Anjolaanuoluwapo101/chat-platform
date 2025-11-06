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
     * Get messages for a group, only if the requesting user is a member.
     *
     * @param int $groupId
     * @param int $requestingUserId
     * @return array|false
     */
    public function getGroupMessages($groupId, $requestingUserId)
    {
        try {
            // Verify membership
            if (!$this->isUserInGroup($groupId, $requestingUserId)) {
                return [];
            }

            $stmt = $this->pdo->prepare("
                SELECT
                    m.id,
                    m.content,
                    m.created_at,
                    GROUP_CONCAT(DISTINCT p.file_path) as photos,
                    GROUP_CONCAT(DISTINCT v.file_path) as videos,
                    GROUP_CONCAT(DISTINCT a.file_path) as audios,
                    u.username AS sender_username
                FROM messages m
                JOIN users u ON m.user_id = u.id
                LEFT JOIN photos p ON m.id = p.message_id
                LEFT JOIN videos v ON m.id = v.message_id
                LEFT JOIN audio a ON m.id = a.message_id
                WHERE m.group_id = ?
                GROUP BY m.id, m.content, m.created_at, u.username
                ORDER BY m.created_at DESC
            ");
            $stmt->execute([$groupId]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($messages as &$message) {
                $photos = $message['photos'] ? explode(',', $message['photos']) : [];
                $videos = $message['videos'] ? explode(',', $message['videos']) : [];
                $audios = $message['audios'] ? explode(',', $message['audios']) : [];

                $message['media_urls'] = array_merge($photos, $videos, $audios);
                unset($message['photos'], $message['videos'], $message['audios']);
            }

            return $messages;
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