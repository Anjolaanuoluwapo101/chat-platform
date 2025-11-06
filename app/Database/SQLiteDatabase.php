<?php

namespace App\Database;

use App\Database\DatabaseInterface;
use PDO;
use PDOException;
use App\Log\Logger;
use App\Traits\DatabaseGroupTrait;

class SQLiteDatabase implements DatabaseInterface
{
    use DatabaseGroupTrait;
    private PDO $pdo;
    private $logger;


    public function __construct()
    {
        $this->logger = new Logger;
        $dbPath = __DIR__ . '/../../database/secretville.db';
        $this->pdo = new PDO("sqlite:" . $dbPath);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->createTables();

        // extra tables for media
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS photos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                mime_type VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages(id)
            );
        ");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                mime_type VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages(id)
            );
        ");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS audio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                mime_type VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages(id)
            );
        ");
    }

    private function createTables(): void
    {
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email TEXT,
                verification_code TEXT,
                is_verified INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // Groups and membership tables

         $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                is_anonymous INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME
            )
        ");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS group_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                group_id INTEGER DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )
        ");
    }

    

    public function connect(): void
    {
        // Connection is established in constructor
    }

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
                ORDER BY m.created_at DESC
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
                //return the message id of the last inserted message

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


    public function savePhoto($media)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO photos (message_id, file_path, mime_type) VALUES (?, ?, ?)");
            return $stmt->execute([$media['message_id'], $media['file_path'], $media['mime_type']]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function saveVideo($media)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO videos (message_id, file_path, mime_type) VALUES (?, ?, ?)");
            return $stmt->execute([$media['message_id'], $media['file_path'], $media['mime_type']]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function saveAudio($media)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO audio (message_id, file_path, mime_type) VALUES (?, ?, ?)");
            return $stmt->execute([$media['message_id'], $media['file_path'], $media['mime_type']]);
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

    /**
     * Return array of user ids who are members of the group
     */
    public function getGroupMembers($groupId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT user_id FROM group_members WHERE group_id = ?");
            $stmt->execute([$groupId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $ids = array_map(function ($r) { return (int)$r['user_id']; }, $rows);
            return $ids;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

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
            
            return array_map(function($group) {
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

    /*
    * Add Admin(not yet implement in this Database)
    */
    public function addAdmin($groupId, $userId)
    {

    }


    /*
    * Get Group Members
    */
    public function getGroup($groupId)
    {
    }

    /**
     * Get paginated messages for a group, optionally starting from a specific message
     */
    public function getGroupMessagesPaginated($groupId, $requestingUserId, $limit = 50, $beforeMessageId = null)
    {
        try {
            $params = ['group_id' => $groupId];
            $beforeClause = '';
            
            if ($beforeMessageId) {
                $beforeClause = "AND m.id < :before_id";
                $params['before_id'] = $beforeMessageId;
            }
            
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
                ORDER BY m.created_at DESC
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
            // For SQLite we don't actually need to do anything since we calculate
            // unread counts based on the last message timestamp for each user.
            // But we can add a last_read table if needed for consistency with Redis
            return true;
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }
}
