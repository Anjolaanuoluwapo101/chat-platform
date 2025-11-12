<?php

namespace App\Database;

use App\Config\Config;
use PDO;
use PDOException;
use App\Log\Logger;

class MySQLDatabase extends AbstractSQLDatabase
{
    protected function getDatabaseConfig()
    {
        return Config::get('mysql') ;
    }
    
    protected function getDSN($config)
    {
        return "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']}";
    }
    
    protected function getOptions($config)
    {
        return [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
    }
    
    protected function getAutoIncrementType(): string
    {
        return "INT AUTO_INCREMENT PRIMARY KEY";
    }
    
    protected function getIntegerType(): string
    {
        return "INT";
    }
    
    protected function getTimestampType(): string
    {
        return "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
    }
    
    protected function getCurrentTimestampFunction(): string
    {
        return "CURRENT_TIMESTAMP";
    }

    protected function createTables(): void
    {
        // Users table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id " . $this->getAutoIncrementType() . ",
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email VARCHAR(255),
                verification_code VARCHAR(255),
                is_verified TINYINT(1) DEFAULT 0,
                created_at " . $this->getTimestampType() . "
            )
        ");

        // Groups table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS groups (
                id " . $this->getAutoIncrementType() . ",
                name VARCHAR(255) UNIQUE NOT NULL,
                is_anonymous TINYINT(1) DEFAULT 1,
                created_at " . $this->getTimestampType() . ",
                updated_at TIMESTAMP NULL DEFAULT NULL
            )
        ");

        // Group members table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS group_members (
                id " . $this->getAutoIncrementType() . ",
                group_id " . $this->getIntegerType() . " NOT NULL,
                user_id " . $this->getIntegerType() . " NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Group admins table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS group_admins (
                id " . $this->getAutoIncrementType() . ",
                group_id " . $this->getIntegerType() . " NOT NULL,
                user_id " . $this->getIntegerType() . " NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Group bans table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS group_bans (
                id " . $this->getAutoIncrementType() . ",
                group_id " . $this->getIntegerType() . " NOT NULL,
                user_id " . $this->getIntegerType() . " NOT NULL,
                banned_at " . $this->getTimestampType() . ",
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Last read table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS last_read (
                id " . $this->getAutoIncrementType() . ",
                group_id " . $this->getIntegerType() . " NOT NULL,
                user_id " . $this->getIntegerType() . " NOT NULL,
                last_read_message_id " . $this->getIntegerType() . " NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_group_user (group_id, user_id)
            )
        ");

        // Messages table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS messages (
                id " . $this->getAutoIncrementType() . ",
                user_id " . $this->getIntegerType() . " NOT NULL,
                content TEXT NOT NULL,
                created_at " . $this->getTimestampType() . ",
                group_id " . $this->getIntegerType() . " DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
            )
        ");
    }


    
    public function getUser($username)
    {
        
        return null;
    }
    
    public function getUserById($userId)
    {
        
        return null;
    }
    
    public function saveUser($user)
    {
        
        return false;
    }
    
    public function updateUser($username, $data)
    {
        
        return false;
    }
    
    public function getMessages($username)
    {
        
        return [];
    }
    
    public function saveMessage($message)
    {
        
        return false;
    }
    
    public function getMessageById($messageId, $groupId)
    {
        
        return null;
    }
    
    public function savePhoto($media)
    {
        
        return false;
    }
    
    public function saveVideo($media)
    {
        
        return false;
    }
    
    public function saveAudio($media)
    {
        
        return false;
    }
    
    public function getPhotos($messageId)
    {
        
        return [];
    }
    
    public function getVideos($messageId)
    {
        
        return [];
    }
    
    public function getAudios($messageId)
    {
        
        return [];
    }
    
    public function createGroup($name, $isAnonymous = true)
    {
        
        return false;
    }
    
    public function addAdmin($groupId, $userId)
    {
        
        return false;
    }
    
    public function addGroupMember($groupId, $userId)
    {
        
        return false;
    }

    public function removeGroupMember($groupId, $userId)
    {
        
        return false;
    }
    
    public function isUserInGroup($groupId, $userId)
    {
        
        return false;
    }
    
    public function getGroupInfo($groupId)
    {
        
        return null;
    }
    
    public function getGroupMembers($groupId)
    {
        
        return [];
    }
    
    public function removeAdmin($groupId, $userId)
    {
        
        return false;
    }
    
    public function isAdmin($groupId, $userId)
    {
        
        return false;
    }
    
    public function getGroupAdmins($groupId)
    {
        
        return [];
    }
    
    public function deleteGroup($groupId)
    {
        
        return false;
    }
    
    public function banUser($groupId, $userId)
    {
        
        return false;
    }
    
    public function unbanUser($groupId, $userId)
    {
        
        return false;
    }
    
    public function getBannedUsers($groupId)
    {
        
        return [];
    }
    
    public function updateGroupSettings($groupId, $settings)
    {
        
        return false;
    }
    
    public function getGroupMessagesPaginated($groupId, $limit = 50, $beforeMessageId = null, $direction)
    {
        
        return [];
    }
    
    public function markMessagesRead($groupId, $userId, $lastMessageId)
    {
        
        return false;
    }
    
    public function getLastReadMessageId($groupId, $userId)
    {
        
        return null;
    }
    
    public function getUserGroups($userId)
    {
        
        return [];
    }
}