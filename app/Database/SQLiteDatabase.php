<?php

namespace App\Database;

use App\Database\DatabaseInterface;
use PDO;
use PDOException;
use App\Log\Logger;

class SQLiteDatabase implements DatabaseInterface
{
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

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                creator_id INTEGER NOT NULL,
                password_hash TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users(id)
            )
        ");
    }

    public function connect(): void
    {
        // Connection is established in constructor
    }

    public function getUser($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
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
        $stmt = $this->pdo->prepare("
            SELECT m.id, m.content, m.created_at
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE u.username = ? AND m.group_id IS NULL
            ORDER BY m.created_at DESC
        ");
        $stmt->execute([$username]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getGroupMessages($groupId)
    {
        $stmt = $this->pdo->prepare("
            SELECT m.id, m.content, m.created_at, u.username
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.group_id = ?
            ORDER BY m.created_at DESC
        ");
        $stmt->execute([$groupId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveMessage($message)
    {
        try {
            return var_dump($message);
            $stmt = $this->pdo->prepare("
                INSERT INTO messages (user_id, content, group_id)
                SELECT id, ?, ? FROM users WHERE username = ?
            ");
            $groupId = $message['group_id'] ?? null;
            if($stmt->execute([$message['content'], $groupId, $message['username']])){
                //return the message id of the last inserted message

                $stmt = $this->pdo->prepare("SELECT id FROM messages WHERE content = ? ORDER BY created_at DESC LIMIT 1");
                $stmt->execute([$message['content']]);
                return $stmt->fetch(PDO::FETCH_ASSOC)['id'];
            }else{
                return false;
            }
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function getGroup($groupId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM groups WHERE id = ?");
        $stmt->execute([$groupId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAllGroups()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM groups ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveGroup($group)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO groups (name, creator_id, password_hash) VALUES (?, ?, ?)");
            return $stmt->execute([$group['name'], $group['creator_id'], $group['password_hash'] ?? null]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }

    public function deleteGroup($groupId, $creatorId)
    {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM groups WHERE id = ? AND creator_id = ?");
            return $stmt->execute([$groupId, $creatorId]);
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
        $stmt = $this->pdo->prepare("SELECT * FROM photos WHERE message_id = ?");
        $stmt->execute([$messageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getVideos($messageId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM videos WHERE message_id = ?");
        $stmt->execute([$messageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAudios($messageId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM audio WHERE message_id = ?");
        $stmt->execute([$messageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
