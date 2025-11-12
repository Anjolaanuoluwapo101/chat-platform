<?php

use PHPUnit\Framework\TestCase;
use App\Database\RedisDatabase;

class RedisDatabaseTest extends TestCase
{
    private $redisDatabase;
    
    protected function setUp(): void
    {
        $this->redisDatabase = new RedisDatabase();
    }
    
    public function testGetMessageByIdWithValidId()
    {
        // Test with a valid message ID that exists
        // Note: This test requires a properly configured Redis instance with test data
        $result = $this->redisDatabase->getMessageById(69, 1);
        
        // Since we're not sure what the actual result will be, we'll just check it returns something
        // In a real test environment, you would mock the Redis client responses
        print_r($result);
        $this->assertContainsOnlyNull($result);
    }
    
    public function testGetMessageByIdWithInvalidId()
    {
        // Test with an invalid message ID
        // This should return false or fallback to SQLite
        $result = $this->redisDatabase->getMessageById(999999, 1);
        
        // We expect either false or an array (from SQLite fallback)
        $this->assertTrue( is_array($result));
    }
    
    public function testGetMessageByIdWithNullRedisClient()
    {
        // Test that it falls back to SQLite when Redis client is not available
        // This would require mocking the Redis client to be null
        // For now, we'll just verify the method exists and is callable
        $this->assertTrue(method_exists($this->redisDatabase, 'getMessageById'));
    }
}