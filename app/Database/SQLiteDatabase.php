<?php

namespace App\Database;

use App\Config\Config;
use PDO;
use PDOException;
use App\Log\Logger;
use App\Traits\DatabaseGroupTrait;

class SQLiteDatabase extends AbstractSQLDatabase
{
    use DatabaseGroupTrait;

    public function __construct(){
        parent::__construct();
    }

    protected function getDatabaseConfig()
    {
        return  [
            'path' => __DIR__ . '/../../database/secretville.db',
        ];
    }
    
    protected function getDSN($config)
    {
        return "sqlite:" . $config['path'];
    }
    
    protected function getOptions($config)
    {
        return [];
    }
    
    protected function getAutoIncrementType(): string
    {
        return "INTEGER PRIMARY KEY AUTOINCREMENT";
    }
    
    protected function getIntegerType(): string
    {
        return "INTEGER";
    }
    
    protected function getTimestampType(): string
    {
        return "DATETIME DEFAULT CURRENT_TIMESTAMP";
    }
    
    protected function getCurrentTimestampFunction(): string
    {
        return "CURRENT_TIMESTAMP";
    }

    protected function createTables(): void
    {
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id " . $this->getAutoIncrementType() . ",
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email TEXT,
                verification_code TEXT,
                is_verified INTEGER DEFAULT 0,
                created_at " . $this->getTimestampType() . "
            )
        ");

        // Groups and membership tables
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS groups (
                id " . $this->getAutoIncrementType() . ",
                name TEXT UNIQUE NOT NULL,
                is_anonymous INTEGER DEFAULT 1,
                created_at " . $this->getTimestampType() . ",
                updated_at DATETIME
            )
        ");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS group_members (
                id " . $this->getAutoIncrementType() . ",
                group_id " . $this->getIntegerType() . " NOT NULL,
                user_id " . $this->getIntegerType() . " NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS group_admins (
                id " . $this->getAutoIncrementType() . ",
                group_id " . $this->getIntegerType() . " NOT NULL,
                user_id " . $this->getIntegerType() . " NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS group_bans (
                id " . $this->getAutoIncrementType() . ",
                group_id " . $this->getIntegerType() . " NOT NULL,
                user_id " . $this->getIntegerType() . " NOT NULL,
                banned_at " . $this->getTimestampType() . ",
                FOREIGN KEY (group_id) REFERENCES groups(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ");

        // Create the last read table that works with markMessagesRead method with unique 
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS last_read (
                id " . $this->getAutoIncrementType() . ",
                group_id " . $this->getIntegerType() . " NOT NULL,
                user_id " . $this->getIntegerType() . " NOT NULL,
                last_read_message_id " . $this->getIntegerType() . " NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE (group_id, user_id)
            )
        ");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS messages (
                id " . $this->getAutoIncrementType() . ",
                user_id " . $this->getIntegerType() . " NOT NULL,
                content TEXT NOT NULL,
                created_at " . $this->getTimestampType() . ",
                group_id " . $this->getIntegerType() . " DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )
        ");
    }

    // Connection
    public function connect(): void
    {
        // parent::connect();
        try{
            $this->logger->log("Connecting to the database...");
            $config = $this->getDatabaseConfig();
            $this->logger->log("Using database config: " . json_encode($config));
            $this->pdo  = new PDO($this->getDSN($config));
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
        }
    }

    // User management
    public function getUser($username)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            return $user ?: null;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /*
    * Get User By Id
    */
    public function getUserById($userId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([(int)$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            return $user ?: null;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function saveUser($user)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO users (username, password_hash, email, verification_code, is_verified) VALUES (?, ?, ?, ?, ?)");
            return $stmt->execute([
                $user['username'],
                $user['password_hash'],
                $user['email'] ?? null,
                $user['verification_code'] ?? null,
                $user['is_verified'] ?? 0
            ]);
        } catch (PDOException $e) {
            return false;
        }
    }

    public function updateUser($username, $data)
    {
        try {
            $fields = [];
            $values = [];
            foreach ($data as $field => $value) {
                $fields[] = "$field = ?";
                $values[] = $value;
            }
            $values[] = $username;

            $stmt = $this->pdo->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE username = ?");
            return $stmt->execute($values);
        } catch (PDOException $e) {
            return false;
        }
    }

    // Message management for single channel communication
    public function getMessages($username)
    {
        try {
            $stmt = $this->pdo->prepare("
                SELECT
                    m.id,
                    m.content,
                    m.created_at,
                    GROUP_CONCAT(DISTINCT p.file_path) as photos,
                    GROUP_CONCAT(DISTINCT v.file_path) as videos,
                    GROUP_CONCAT(DISTINCT a.file_path) as audios
                FROM messages m
                JOIN users u ON m.user_id = u.id
                LEFT JOIN photos p ON m.id = p.message_id
                LEFT JOIN videos v ON m.id = v.message_id
                LEFT JOIN audio a ON m.id = a.message_id
                WHERE u.username = ? AND m.group_id IS NULL
                GROUP BY m.id, m.content, m.created_at
                ORDER BY m.created_at ASC
            ");
            $stmt->execute([$username]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convert comma-separated strings to arrays and merge into media_urls
            foreach ($messages as &$message) {
                $photos = $message['photos'] ? explode(',', $message['photos']) : [];
                $videos = $message['videos'] ? explode(',', $message['videos']) : [];
                $audios = $message['audios'] ? explode(',', $message['audios']) : [];

                $message['media_urls'] = array_merge($photos, $videos, $audios);

                // Remove the separate arrays
                unset($message['photos'], $message['videos'], $message['audios']);
            }

            return $messages;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function saveMessage($message)
    {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO messages (user_id, content, group_id)
                SELECT id, ?, ? FROM users WHERE username = ?
            ");
            $groupId = $message['group_id'] ?? null;
            if ($stmt->execute([$message['content'], $groupId, $message['username']])) {
                // Return the message id of the last inserted message
                $stmt = $this->pdo->prepare("SELECT id FROM messages WHERE content = ? ORDER BY created_at DESC LIMIT 1");
                $stmt->execute([$message['content']]);
                return $stmt->fetch(PDO::FETCH_ASSOC)['id'];
            } else {
                return false;
            }
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Get a message by its ID
     */
    public function getMessageById($messageId, $groupId = null)
    {
        try {
            $stmt = $this->pdo->prepare("
                SELECT
                    m.id,
                    m.content,
                    m.created_at,
                    m.group_id,
                    u.username,
                    CASE
                        WHEN g.is_anonymous THEN 'Anonymous'
                        ELSE u.username
                    END AS sender,
                    GROUP_CONCAT(DISTINCT p.file_path) as photos,
                    GROUP_CONCAT(DISTINCT v.file_path) as videos,
                    GROUP_CONCAT(DISTINCT a.file_path) as audios
                FROM messages m
                JOIN users u ON m.user_id = u.id
                JOIN groups g ON m.group_id = g.id
                LEFT JOIN photos p ON m.id = p.message_id
                LEFT JOIN videos v ON m.id = v.message_id
                LEFT JOIN audio a ON m.id = a.message_id
                WHERE m.id = ?
                GROUP BY m.id, m.content, m.created_at, m.group_id, u.username
            ");
            $stmt->execute([$messageId]);
            $message = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$message) {
                return null;
            }

            // Process media urls
            $photos = $message['photos'] ? explode(',', $message['photos']) : [];
            $videos = $message['videos'] ? explode(',', $message['videos']) : [];
            $audios = $message['audios'] ? explode(',', $message['audios']) : [];

            $message['media_urls'] = array_merge($photos, $videos, $audios);
            unset($message['photos'], $message['videos'], $message['audios']);

            return $message;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return null;
        }
    }

    // Media management
    public function savePhoto($media)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO photos (message_id, file_path) VALUES (?, ?)");
            return $stmt->execute([$media['message_id'], $media['file_path']]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function saveVideo($media)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO videos (message_id, file_path) VALUES (?, ?)");
            return $stmt->execute([$media['message_id'], $media['file_path']]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function saveAudio($media)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO audio (message_id, file_path) VALUES (?, ?");
            return $stmt->execute([$media['message_id'], $media['file_path']]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function getPhotos($messageId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM photos WHERE message_id = ?");
            $stmt->execute([$messageId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function getVideos($messageId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM videos WHERE message_id = ?");
            $stmt->execute([$messageId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function getAudios($messageId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM audio WHERE message_id = ?");
            $stmt->execute([$messageId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    // Group support
    public function getGroupInfo($groupId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM groups WHERE id = ?");
            $stmt->execute([$groupId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    } 

    /**
     * Return array of user ids who are members of the group
     */
    public function getGroupMembers($groupId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT user_id FROM group_members WHERE group_id = ?");
            $stmt->execute([$groupId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $ids = array_map(function ($r) {
                return (int)$r['user_id'];
            }, $rows);
            return $ids;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    // User group interactions
    /**
     * Get all groups a user is a member of, with some basic stats
     */
    public function getUserGroups($userId)
    {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    g.id,
                    g.name,
                    m.content as last_message_summary,
                    m.created_at as last_message_ts,
                    COUNT(DISTINCT m2.id) as unread_count
                FROM groups g
                JOIN group_members gm ON g.id = gm.group_id
                LEFT JOIN messages m ON g.id = m.group_id 
                    AND m.id = (
                        SELECT id FROM messages 
                        WHERE group_id = g.id 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    )
                LEFT JOIN messages m2 ON g.id = m2.group_id
                    AND m2.created_at > COALESCE(
                        (SELECT MAX(created_at) FROM messages
                        WHERE group_id = g.id AND user_id = :user_id),
                        '1970-01-01'
                    )
                WHERE gm.user_id = :user_id
                GROUP BY g.id, g.name, m.content, m.created_at
                ORDER BY m.created_at DESC NULLS LAST
            ");

            $stmt->execute(['user_id' => $userId]);
            $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return array_map(function ($group) {
                return [
                    'id' => (int)$group['id'],
                    'name' => $group['name'],
                    'last_message_summary' => $group['last_message_summary'] ?? '',
                    'last_message_ts' => strtotime($group['last_message_ts'] ?? '1970-01-01'),
                    'unread_count' => (int)$group['unread_count']
                ];
            }, $groups);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return [];
        }
    }

    // Group messaging
    /**
     * Get paginated messages for a group, optionally starting from a specific message
     */
    public function getGroupMessagesPaginated($groupId,  $limit = 50, $beforeMessageId = null, $direction = 'before')
    {
        try {
            $params = ['group_id' => $groupId];
            $beforeClause = '';

            if ($beforeMessageId) {
                if ($direction === 'after') {
                    $beforeClause = "AND m.id > :before_id";
                } else {
                    $beforeClause = "AND m.id < :before_id";
                }
                $params['before_id'] = $beforeMessageId;
            }

            $orderDirection = ($direction === 'after') ? 'ASC' : 'DESC';

            $stmt = $this->pdo->prepare("
                SELECT
                    m.id,
                    m.content,
                    m.created_at,
                    CASE WHEN g.is_anonymous = 1 THEN 'Anonymous' ELSE u.username END as username,
                    GROUP_CONCAT(DISTINCT p.file_path) as photos,
                    GROUP_CONCAT(DISTINCT v.file_path) as videos,
                    GROUP_CONCAT(DISTINCT a.file_path) as audios
                FROM messages m
                JOIN users u ON m.user_id = u.id
                JOIN groups g ON m.group_id = g.id
                LEFT JOIN photos p ON m.id = p.message_id
                LEFT JOIN videos v ON m.id = v.message_id
                LEFT JOIN audio a ON m.id = a.message_id
                WHERE m.group_id = :group_id {$beforeClause}
                GROUP BY m.id, m.content, m.created_at, u.username, g.is_anonymous
                ORDER BY m.created_at {$orderDirection}
                LIMIT :limit
            ");

            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            foreach ($params as $key => $value) {
                $stmt->bindValue(':' . $key, $value);
            }

            $stmt->execute();
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Process media urls
            foreach ($messages as &$message) {
                $photos = $message['photos'] ? explode(',', $message['photos']) : [];
                $videos = $message['videos'] ? explode(',', $message['videos']) : [];
                $audios = $message['audios'] ? explode(',', $message['audios']) : [];

                $message['media_urls'] = array_merge($photos, $videos, $audios);
                unset($message['photos'], $message['videos'], $message['audios']);
            }

            return array_reverse($messages); // Return in chronological order
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return [];
        }
    }

    /**
     * Mark messages as read up to a specific message and track last read
     */
    public function markMessagesRead($groupId, $userId, $lastMessageId)
    {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO last_read (group_id, user_id, last_read_message_id)
                VALUES (:group_id, :user_id, :last_message_id)
                ON CONFLICT(group_id, user_id) DO UPDATE SET last_read_message_id = excluded.last_read_message_id
            ");
            $stmt->execute([
                ':group_id' => $groupId,
                ':user_id' => $userId,
                ':last_message_id' => $lastMessageId
            ]);
            return true;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Get the last read message ID for a user in a group
     */
    public function getLastReadMessageId($groupId, $userId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT last_read_message_id FROM last_read WHERE group_id = ? AND user_id = ?");
            $stmt->execute([$groupId, $userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? (int)$result['last_read_message_id'] : null;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return null;
        }
    }

    // Group admin operations
    /*
    * Add Admin(not yet implement in this Database)
    */
    public function addAdmin($groupId, $userId)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO group_admins (group_id, user_id) VALUES (?, ?)");
            return $stmt->execute([$groupId, $userId]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Remove admin privileges from a user in a group
     */
    public function removeAdmin($groupId, $userId)
    {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM group_admins WHERE group_id = ? AND user_id = ?");
            return $stmt->execute([$groupId, $userId]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Check if a user is an admin of a group
     */
    public function isAdmin($groupId, $userId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT id FROM group_admins WHERE group_id = ? AND user_id = ?");
            $stmt->execute([$groupId, $userId]);
            return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Get all admins of a group
     */
    public function getGroupAdmins($groupId)
    {
        try {
            $stmt = $this->pdo->prepare("
                SELECT u.id, u.username
                FROM group_admins ga
                JOIN users u ON ga.user_id = u.id
                WHERE ga.group_id = ?
            ");
            $stmt->execute([$groupId]);
            $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return array_map(function($admin) {
                return [
                    'id' => (int)$admin['id'],
                    'username' => $admin['username']
                ];
            }, $admins);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return [];
        }
    }

    // Group moderation
    /**
     * Ban a user from a group
     */
    public function banUser($groupId, $userId)
    {
        try {
            // Check if already banned
            $stmt = $this->pdo->prepare("SELECT id FROM group_bans WHERE group_id = ? AND user_id = ?");
            $stmt->execute([$groupId, $userId]);
            if ($stmt->fetch(PDO::FETCH_ASSOC)) {
                return true; // Already banned
            }

            $stmt = $this->pdo->prepare("INSERT INTO group_bans (group_id, user_id) VALUES (?, ?)");
            return $stmt->execute([$groupId, $userId]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Unban a user from a group
     */
    public function unbanUser($groupId, $userId)
    {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM group_bans WHERE group_id = ? AND user_id = ?");
            return $stmt->execute([$groupId, $userId]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Get all banned users in a group
     */
    public function getBannedUsers($groupId)
    {
        try {
            $stmt = $this->pdo->prepare("
                SELECT u.id, u.username, gb.banned_at
                FROM group_bans gb
                JOIN users u ON gb.user_id = u.id
                WHERE gb.group_id = ?
                ORDER BY gb.banned_at DESC
            ");
            $stmt->execute([$groupId]);
            $bannedUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return array_map(function($user) {
                return [
                    'id' => (int)$user['id'],
                    'username' => $user['username'],
                    'banned_at' => $user['banned_at']
                ];
            }, $bannedUsers);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return [];
        }
    }

    /**
     * Delete a group and all related data
     */
    public function deleteGroup($groupId)
    {
        try {
            $this->pdo->beginTransaction();

            // Delete related records first (foreign key constraints)
            $stmt = $this->pdo->prepare("DELETE FROM group_members WHERE group_id = ?");
            $stmt->execute([$groupId]);

            $stmt = $this->pdo->prepare("DELETE FROM group_admins WHERE group_id = ?");
            $stmt->execute([$groupId]);

            $stmt = $this->pdo->prepare("DELETE FROM group_bans WHERE group_id = ?");
            $stmt->execute([$groupId]);

            $stmt = $this->pdo->prepare("DELETE FROM last_read WHERE group_id = ?");
            $stmt->execute([$groupId]);

            // Delete messages and their media
            $stmt = $this->pdo->prepare("SELECT id FROM messages WHERE group_id = ?");
            $stmt->execute([$groupId]);
            $messageIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            if (!empty($messageIds)) {
                $placeholders = implode(',', array_fill(0, count($messageIds), '?'));
                $stmt = $this->pdo->prepare("DELETE FROM photos WHERE message_id IN ($placeholders)");
                $stmt->execute($messageIds);

                $stmt = $this->pdo->prepare("DELETE FROM videos WHERE message_id IN ($placeholders)");
                $stmt->execute($messageIds);

                $stmt = $this->pdo->prepare("DELETE FROM audio WHERE message_id IN ($placeholders)");
                $stmt->execute($messageIds);
            }

            $stmt = $this->pdo->prepare("DELETE FROM messages WHERE group_id = ?");
            $stmt->execute([$groupId]);

            // Finally delete the group itself
            $stmt = $this->pdo->prepare("DELETE FROM groups WHERE id = ?");
            $result = $stmt->execute([$groupId]);

            $this->pdo->commit();
            return $result;
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    /**
     * Update group settings
     */
    public function updateGroupSettings($groupId, $settings)
    {
        try {
            $allowedFields = ['name', 'is_anonymous', 'updated_at'];
            $fields = [];
            $values = [];

            foreach ($settings as $field => $value) {
                if (in_array($field, $allowedFields)) {
                    $fields[] = "$field = ?";
                    $values[] = $value;
                }
            }

            if (empty($fields)) {
                return true; // No valid fields to update
            }

            // Always update the updated_at timestamp
            if (!isset($settings['updated_at'])) {
                $fields[] = "updated_at = " . $this->getCurrentTimestampFunction();
            }

            $values[] = $groupId;

            $stmt = $this->pdo->prepare("UPDATE groups SET " . implode(', ', $fields) . " WHERE id = ?");
            return $stmt->execute($values);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function createGroup($name, $isAnonymous = true)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO groups (name, is_anonymous, created_at) VALUES (?, ?, " . $this->getCurrentTimestampFunction() . ")");
            if ($stmt->execute([$name, $isAnonymous ? 1 : 0])) {
                return $this->pdo->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function addGroupMember($groupId, $userId)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)");
            return $stmt->execute([$groupId, $userId]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function removeGroupMember($groupId, $userId)
    {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?");
            return $stmt->execute([$groupId, $userId]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

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
}