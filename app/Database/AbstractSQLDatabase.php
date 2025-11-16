<?php

namespace App\Database;

use App\Log\Logger;
use PDO;
use PDOException;

abstract class AbstractSQLDatabase implements DatabaseInterface
{
    protected $pdo;
    protected $logger;
    
    public function __construct()
    {
        $this->logger = new Logger();
        $this->connect();
        $this->createTables();
        $this->createMediaTables();
    }
    
    /**
     * Get database configuration
     */
    abstract protected function getDatabaseConfig();
    
    /**
     * Get DSN for PDO connection
     */
    abstract protected function getDSN($config);
    
    /**
     * Get database-specific options
     */
    abstract protected function getOptions($config);
    
    /**
     * Connect to the database
     */
    public function connect(): void
    {
        try {
            $config = $this->getDatabaseConfig();
            $dsn = $this->getDSN($config);
            $options = $this->getOptions($config);
            
            $this->pdo = new PDO($dsn, $config['username'] ?? null, $config['password'] ?? null, $options);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            $this->logger->log('Database connection failed: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Create core tables
     */
    abstract protected function createTables(): void;
    
    /**
     * Create media tables
     */
    protected function createMediaTables(): void
    {
        // Photos table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS photos (
                id " . $this->getAutoIncrementType() . ",
                message_id " . $this->getIntegerType() . " NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                created_at " . $this->getTimestampType() . ",
                FOREIGN KEY (message_id) REFERENCES messages(id)
            );
        ");
        
        // Videos table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS videos (
                id " . $this->getAutoIncrementType() . ",
                message_id " . $this->getIntegerType() . " NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                created_at " . $this->getTimestampType() . ",
                FOREIGN KEY (message_id) REFERENCES messages(id)
            );
        ");
        
        // Audio table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS audio (
                id " . $this->getAutoIncrementType() . ",
                message_id " . $this->getIntegerType() . " NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                created_at " . $this->getTimestampType() . ",
                FOREIGN KEY (message_id) REFERENCES messages(id)
            );
        ");
    }
    
    /**
     * Get auto increment column type for this database
     */
    abstract protected function getAutoIncrementType(): string;
    
    /**
     * Get integer column type for this database
     */
    abstract protected function getIntegerType(): string;
    
    /**
     * Get timestamp column type for this database
     */
    abstract protected function getTimestampType(): string;
    
    /**
     * Get current timestamp function for this database
     */
    abstract protected function getCurrentTimestampFunction(): string;
    
    // Abstract methods that must be implemented by concrete classes
    abstract public function getUser($username);
    abstract public function getUserById($userId);
    abstract public function saveUser($user);
    abstract public function updateUser($username, $data);
    abstract public function getMessages($username);
    abstract public function saveMessage($message);
    abstract public function getMessageById($messageId, $groupId);
    abstract public function savePhoto($media);
    abstract public function saveVideo($media);
    abstract public function saveAudio($media);
    abstract public function getPhotos($messageId);
    abstract public function getVideos($messageId);
    abstract public function getAudios($messageId);
    abstract public function createGroup($name, $isAnonymous = true);
    abstract public function addAdmin($groupId, $userId);
    abstract public function addGroupMember($groupId, $userId);
    abstract public function isUserInGroup($groupId, $userId);
    abstract public function getGroupInfo($groupId);
    abstract public function getGroupMembers($groupId);
    abstract public function removeAdmin($groupId, $userId);
    abstract public function isAdmin($groupId, $userId);
    abstract public function getGroupAdmins($groupId);
    abstract public function deleteGroup($groupId);
    abstract public function banUser($groupId, $userId);
    abstract public function unbanUser($groupId, $userId);
    abstract public function getBannedUsers($groupId);
    abstract public function updateGroupSettings($groupId, $settings);
    abstract public function getGroupMessagesPaginated($groupId, $limit, $beforeMessageId, $direction);
    abstract public function markMessagesRead($groupId, $userId, $lastMessageId);
    abstract public function getLastReadMessageId($groupId, $userId);
    abstract public function getUserGroups($userId);
}