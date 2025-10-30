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
                FOREIGN KEY (user_id) REFERENCES users(id)
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
            SELECT m.content, m.created_at
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE u.username = ?
            ORDER BY m.created_at DESC
        ");
        $stmt->execute([$username]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveMessage($message)
    {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO messages (user_id, content)
                SELECT id, ? FROM users WHERE username = ?
            ");
            return $stmt->execute([$message['content'], $message['username']]);
        } catch (PDOException $e) {
            $this->logger->log($e->getMessage());
            return false;
        }
    }
}
