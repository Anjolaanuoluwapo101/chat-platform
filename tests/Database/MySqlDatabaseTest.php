<?php

use PHPUnit\Framework\TestCase;
use App\Database\MySQLDatabase;

class MySqlDatabaseTest extends TestCase
{
    private $mysqlDatabase;
    
    protected function setUp(): void
    {
        $this->mysqlDatabase = new MySQLDatabase();
    }
    
    // INITIALIZATION TESTS
    public function testConstructor()
    {
        echo "\n--- Testing Constructor ---\n";
        $this->assertInstanceOf(MySQLDatabase::class, $this->mysqlDatabase);
        echo "✓ Constructor test passed - MySQLDatabase instance created\n";
    }
    
    public function testAllMethodsExist()
    {
        echo "\n--- Testing All Methods Exist ---\n";
        $methods = [
            'getUser',
            'getUserById',
            'saveUser',
            'updateUser',
            'getMessages',
            'saveMessage',
            'getMessageById',
            'savePhoto',
            'saveVideo',
            'saveAudio',
            'getPhotos',
            'getVideos',
            'getAudios',
            'getGroupInfo',
            'getGroupMembers',
            'getUserGroups',
            'getGroupMessagesPaginated',
            'markMessagesRead',
            'getLastReadMessageId',
            'addAdmin',
            'removeAdmin',
            'isAdmin',
            'getGroupAdmins',
            'banUser',
            'unbanUser',
            'getBannedUsers',
            'deleteGroup',
            'updateGroupSettings',
            'createGroup',
            'addGroupMember',
            'removeGroupMember',
            'isUserInGroup'
        ];
        
        foreach ($methods as $method) {
            $this->assertTrue(
                method_exists($this->mysqlDatabase, $method),
                "Method {$method} should exist in MySQLDatabase"
            );
        }
        echo "✓ All " . count($methods) . " methods exist\n";
    }
    
    // USER MANAGEMENT - CREATE
    public function testSaveUser()
    {
        echo "\n--- Testing User Creation (saveUser) ---\n";
        $user = [
            'username' => 'testuser_' . time(),
            'password_hash' => 'hashedpass123',
            'email' => 'test_' . time() . '@example.com'
        ];
        $result = $this->mysqlDatabase->saveUser($user);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Saved user: " . $user['username'] . "\n";
        $this->assertTrue(is_bool($result));
    }
    
    // USER MANAGEMENT - READ
    public function testGetUser()
    {
        echo "\n--- Testing Get User (getUser) ---\n";
        $result = $this->mysqlDatabase->getUser('testuser_1763306226');
        echo "Result type: " . gettype($result) . "\n";
        if (is_array($result)) {
            echo "User found: " . json_encode($result) . "\n";
        } else {
            echo "User not found or error\n";
        }
        $this->assertTrue(is_null($result) || is_array($result) || is_bool($result));
    }
    
    public function testGetUserById()
    {
        echo "\n--- Testing Get User By ID (getUserById) ---\n";
        $result = $this->mysqlDatabase->getUserById(1);
        echo "Result type: " . gettype($result) . "\n";
        if (is_array($result)) {
            echo "User data: " . json_encode($result) . "\n";
        } else {
            echo "No user found with ID 1\n";
        }
        $this->assertTrue(is_null($result) || is_array($result) || is_bool($result));
    }
    
    // USER MANAGEMENT - UPDATE
    public function testUpdateUser()
    {
        echo "\n--- Testing Update User (updateUser) ---\n";
        $data = ['email' => 'updated_' . time() . '@example.com'];
        $result = $this->mysqlDatabase->updateUser('testuser_1763306226', $data);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Updated email to: " . $data['email'] . "\n";
        $this->assertTrue(is_bool($result));
    }
    
    // MESSAGE MANAGEMENT - CREATE
    public function testSaveMessage()
    {
        echo "\n--- Testing Message Creation (saveMessage) ---\n";
        $message = [
            'username' => 'testuser_1763306226',
            'content' => 'Test message ' . time()
        ];
        $result = $this->mysqlDatabase->saveMessage($message);
        echo "Result type: " . gettype($result) . "\n";
        echo "Result: " . ($result ? $result : 'failed') . "\n";
        echo "Content: " . $message['content'] . "\n";
        $this->assertTrue(is_bool($result) || is_int($result));
    }
    
    // MESSAGE MANAGEMENT - READ
    public function testGetMessages()
    {
        echo "\n--- Testing Get Messages (getMessages) ---\n";
        $result = $this->mysqlDatabase->getMessages('testuser');
        echo "Result type: " . gettype($result) . "\n";
        echo "Result count: " . (is_array($result) ? count($result) : 'error') . "\n";
        $this->assertTrue(is_array($result) || is_bool($result));
    }
    
    public function testGetMessageById()
    {
        echo "\n--- Testing Get Message By ID (getMessageById) ---\n";
        $result = $this->mysqlDatabase->getMessageById(1);
        echo "Result type: " . gettype($result) . "\n";
        if (is_array($result)) {
            echo "Message found: " . json_encode($result) . "\n";
        } else {
            echo "Message not found\n";
        }
        $this->assertTrue(is_null($result) || is_array($result));
    }
    
    // MEDIA MANAGEMENT - CREATE
    public function testSavePhoto()
    {
        echo "\n--- Testing Photo Save (savePhoto) ---\n";
        $media = [
            'message_id' => 1,
            'file_path' => '/uploads/photo_' . time() . '.jpg'
        ];
        $result = $this->mysqlDatabase->savePhoto($media);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "File path: " . $media['file_path'] . "\n";
        $this->assertTrue(is_bool($result));
    }
    
    public function testSaveVideo()
    {
        echo "\n--- Testing Video Save (saveVideo) ---\n";
        $media = [
            'message_id' => 1,
            'file_path' => '/uploads/video_' . time() . '.mp4'
        ];
        $result = $this->mysqlDatabase->saveVideo($media);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "File path: " . $media['file_path'] . "\n";
        $this->assertTrue(is_bool($result));
    }
    
    public function testSaveAudio()
    {
        echo "\n--- Testing Audio Save (saveAudio) ---\n";
        $media = [
            'message_id' => 1,
            'file_path' => '/uploads/audio_' . time() . '.mp3'
        ];
        $result = $this->mysqlDatabase->saveAudio($media);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "File path: " . $media['file_path'] . "\n";
        $this->assertTrue(is_bool($result));
    }
    
    // MEDIA MANAGEMENT - READ
    public function testGetPhotos()
    {
        echo "\n--- Testing Get Photos (getPhotos) ---\n";
        $result = $this->mysqlDatabase->getPhotos(1);
        echo "Result type: " . gettype($result) . "\n";
        echo "Result count: " . (is_array($result) ? count($result) : 'error') . "\n";
        $this->assertTrue(is_array($result) || is_bool($result));
    }
    
    public function testGetVideos()
    {
        echo "\n--- Testing Get Videos (getVideos) ---\n";
        $result = $this->mysqlDatabase->getVideos(1);
        echo "Result type: " . gettype($result) . "\n";
        echo "Result count: " . (is_array($result) ? count($result) : 'error') . "\n";
        $this->assertTrue(is_array($result) || is_bool($result));
    }
    
    public function testGetAudios()
    {
        echo "\n--- Testing Get Audios (getAudios) ---\n";
        $result = $this->mysqlDatabase->getAudios(1);
        echo "Result type: " . gettype($result) . "\n";
        echo "Result count: " . (is_array($result) ? count($result) : 'error') . "\n";
        $this->assertTrue(is_array($result) || is_bool($result));
    }
    
    // GROUP MANAGEMENT - CREATE
    public function testCreateGroup()
    {
        echo "\n--- Testing Group Creation (createGroup) ---\n";
        $groupName = 'Test Group ' . time();
        $result = $this->mysqlDatabase->createGroup($groupName, true);
        echo "Result type: " . gettype($result) . "\n";
        echo "Result: " . ($result ?: 'failed') . "\n";
        echo "Group name: " . $groupName . "\n";
        echo "Is anonymous: true\n";
        $this->assertTrue(is_bool($result) || is_int($result));
    }
    
    // GROUP MANAGEMENT - READ
    public function testGetGroupInfo()
    {
        echo "\n--- Testing Get Group Info (getGroupInfo) ---\n";
        $result = $this->mysqlDatabase->getGroupInfo(1);
        echo "Result type: " . gettype($result) . "\n";
        if (is_array($result)) {
            echo "Group info: " . json_encode($result) . "\n";
        } else {
            echo "Group not found\n";
        }
        $this->assertTrue(is_null($result) || is_array($result) || is_bool($result));
    }
    
    public function testGetGroupMembers()
    {
        echo "\n--- Testing Get Group Members (getGroupMembers) ---\n";
        $result = $this->mysqlDatabase->getGroupMembers(1);
        echo "Result type: " . gettype($result) . "\n";
        echo "Member count: " . (is_array($result) ? count($result) : 'error') . "\n";
        $this->assertTrue(is_array($result) || is_bool($result));
    }
    
    public function testGetUserGroups()
    {
        echo "\n--- Testing Get User Groups (getUserGroups) ---\n";
        $result = $this->mysqlDatabase->getUserGroups(1);
        echo "Result type: " . gettype($result) . "\n";
        echo "Group count: " . count($result) . "\n";
        $this->assertTrue(is_array($result));
    }
    
    // GROUP MEMBERSHIP - CREATE
    public function testAddGroupMember()
    {
        echo "\n--- Testing Add Group Member (addGroupMember) ---\n";
        $result = $this->mysqlDatabase->addGroupMember(7, 1);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Added user ID 1 to group ID 1\n";
        $this->assertTrue(is_bool($result));
    }
    
    // GROUP MEMBERSHIP - READ
    public function testIsUserInGroup()
    {
        echo "\n--- Testing Is User In Group (isUserInGroup) ---\n";
        $result = $this->mysqlDatabase->isUserInGroup(1, 1);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Checking if user ID 1 is in group ID 1\n";
        $this->assertTrue(is_bool($result));
    }
    
    // GROUP MEMBERSHIP - DELETE
    public function testRemoveGroupMember()
    {
        echo "\n--- Testing Remove Group Member (removeGroupMember) ---\n";
        $result = $this->mysqlDatabase->removeGroupMember(1, 1);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Removed user ID 1 from group ID 1\n";
        $this->assertTrue(is_bool($result));
    }
    
    // ADMIN MANAGEMENT - CREATE
    public function testAddAdmin()
    {
        echo "\n--- Testing Add Admin (addAdmin) ---\n";
        $result = $this->mysqlDatabase->addAdmin(1, 1);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Added user ID 1 as admin to group ID 1\n";
        $this->assertTrue(is_bool($result));
    }
    
    // ADMIN MANAGEMENT - READ
    public function testIsAdmin()
    {
        echo "\n--- Testing Is Admin (isAdmin) ---\n";
        $result = $this->mysqlDatabase->isAdmin(1, 1);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Checking if user ID 1 is admin in group ID 1\n";
        $this->assertTrue(is_bool($result));
    }
    
    public function testGetGroupAdmins()
    {
        echo "\n--- Testing Get Group Admins (getGroupAdmins) ---\n";
        $result = $this->mysqlDatabase->getGroupAdmins(1);
        echo "Result type: " . gettype($result) . "\n";
        echo "Admin count: " . count($result) . "\n";
        $this->assertTrue(is_array($result));
    }
    
    // ADMIN MANAGEMENT - DELETE
    public function testRemoveAdmin()
    {
        echo "\n--- Testing Remove Admin (removeAdmin) ---\n";
        $result = $this->mysqlDatabase->removeAdmin(1, 1);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Removed user ID 1 as admin from group ID 1\n";
        $this->assertTrue(is_bool($result));
    }
    
    // BAN MANAGEMENT - CREATE
    public function testBanUser()
    {
        echo "\n--- Testing Ban User (banUser) ---\n";
        $result = $this->mysqlDatabase->banUser(1, 1);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Banned user ID 1 from group ID 1\n";
        $this->assertTrue(is_bool($result));
    }
    
    // BAN MANAGEMENT - READ
    public function testGetBannedUsers()
    {
        echo "\n--- Testing Get Banned Users (getBannedUsers) ---\n";
        $result = $this->mysqlDatabase->getBannedUsers(1);
        echo "Result type: " . gettype($result) . "\n";
        echo "Banned user count: " . count($result) . "\n";
        $this->assertTrue(is_array($result));
    }
    
    // BAN MANAGEMENT - DELETE
    public function testUnbanUser()
    {
        echo "\n--- Testing Unban User (unbanUser) ---\n";
        $result = $this->mysqlDatabase->unbanUser(1, 1);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Unbanned user ID 1 from group ID 1\n";
        $this->assertTrue(is_bool($result));
    }
    
    // GROUP MESSAGES - READ
    public function testGetGroupMessagesPaginated()
    {
        echo "\n--- Testing Get Group Messages Paginated (getGroupMessagesPaginated) ---\n";
        $result = $this->mysqlDatabase->getGroupMessagesPaginated(1, 50);
        echo "Result type: " . gettype($result) . "\n";
        echo "Message count: " . count($result) . "\n";
        echo "Limit: 50\n";
        $this->assertTrue(is_array($result));
    }
    
    // MESSAGE READ TRACKING - CREATE/UPDATE
    public function testMarkMessagesRead()
    {
        echo "\n--- Testing Mark Messages Read (markMessagesRead) ---\n";
        $result = $this->mysqlDatabase->markMessagesRead(1, 1, 1);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Marked messages up to ID 1 as read for user ID 1 in group ID 1\n";
        $this->assertTrue(is_bool($result));
    }
    
    // MESSAGE READ TRACKING - READ
    public function testGetLastReadMessageId()
    {
        echo "\n--- Testing Get Last Read Message ID (getLastReadMessageId) ---\n";
        $result = $this->mysqlDatabase->getLastReadMessageId(1, 1);
        echo "Result type: " . gettype($result) . "\n";
        echo "Result: " . ($result ?: 'null') . "\n";
        $this->assertTrue(is_null($result) || is_int($result));
    }
    
    // GROUP SETTINGS - UPDATE
    public function testUpdateGroupSettings()
    {
        echo "\n--- Testing Update Group Settings (updateGroupSettings) ---\n";
        $settings = ['name' => 'Updated Group ' . time()];
        $result = $this->mysqlDatabase->updateGroupSettings(1, $settings);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Updated group name to: " . $settings['name'] . "\n";
        $this->assertTrue(is_bool($result));
    }
    
    // GROUP MANAGEMENT - DELETE
    public function testDeleteGroup()
    {
        echo "\n--- Testing Delete Group (deleteGroup) ---\n";
        $result = $this->mysqlDatabase->deleteGroup(999);
        echo "Result: " . ($result ? 'true' : 'false') . "\n";
        echo "Attempted to delete group ID 999\n";
        $this->assertTrue(is_bool($result));
    }
}
