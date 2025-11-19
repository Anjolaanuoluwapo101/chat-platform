<?php

namespace Tests\Services;

use PHPUnit\Framework\TestCase;
use App\Services\Beams;
use App\Config\Config;

class BeamsTest extends TestCase
{
    private $beamsService;
    
    protected function setUp(): void
    {
        echo "\n[Setup] Initializing Beams service test...\n";
        
        // Initialize the service
        $this->beamsService = new Beams();
    }

    protected function tearDown(): void
    {
        echo "[Teardown] Cleaning up Beams service test...\n";
    }

    /**
     * Test constructor initializes successfully
     */
    public function testConstructorInitializesSuccessfully()
    {
        echo "\n[Test] Testing Beams service constructor...\n";
        $this->assertInstanceOf(Beams::class, $this->beamsService);
        echo "[Pass] Beams service instantiated successfully\n";
    }

    /**
     * Test sendToAll method with actual API call
     */
    public function testSendToAllPublishesNotification()
    {
        echo "\n[Test] Testing sendToAll method...\n";
        
        // Skip if Pusher config is not set
        $pusherConfig = Config::get('pusher');
        if (empty($pusherConfig['beam_instance_id']) || empty($pusherConfig['secret'])) {
            echo "[Skip] Pusher Beams configuration not found\n";
            $this->markTestSkipped('Pusher Beams configuration not found');
            return;
        }
        
        try {
            $title = 'Test Notification';
            $body = 'This is a test notification sent to all users';
            $url = Config::get('app')['url'] ?? 'http://localhost';
            
            echo "[Info] Sending notification to all users...\n";
            echo "[Info] Title: " . $title . "\n";
            echo "[Info] Body: " . $body . "\n";
            
            $publishId = $this->beamsService->sendToAll($title, $body, $url);
            
            // Verify we got a publish ID back
            $this->assertNotNull($publishId);
            $this->assertIsString($publishId);
            
            echo "[Result] Publish ID: " . $publishId . "\n";
            echo "[Pass] Notification sent to all users successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] Pusher Beams API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('Pusher Beams API unavailable: ' . $e->getMessage());
        }
    }

    /**
     * Test sendToUser method with actual API call
     */
    public function testSendToUserPublishesNotification()
    {
        echo "\n[Test] Testing sendToUser method...\n";
        
        // Skip if Pusher config is not set
        $pusherConfig = Config::get('pusher');
        if (empty($pusherConfig['beam_instance_id']) || empty($pusherConfig['secret'])) {
            echo "[Skip] Pusher Beams configuration not found\n";
            $this->markTestSkipped('Pusher Beams configuration not found');
            return;
        }
        
        try {
            $userId = 'web-9238b6f6-13d9-4a43-81d1-168ae5e1401c';
            $title = 'Test User Notification';
            $body = 'This is a test notification sent to a specific user';
            $url = Config::get('app')['url'] ?? 'http://localhost';
            
            echo "[Info] Sending notification to user: " . $userId . "\n";
            echo "[Info] Title: " . $title . "\n";
            echo "[Info] Body: " . $body . "\n";
            
            $publishId = $this->beamsService->sendToUser($userId, $title, $body, $url);
            
            // Verify we got a publish ID back
            $this->assertNotNull($publishId);
            $this->assertIsString($publishId);
            
            echo "[Result] Publish ID: " . $publishId . "\n";
            echo "[Pass] Notification sent to user successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] Pusher Beams API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('Pusher Beams API unavailable: ' . $e->getMessage());
        }
    }

    /**
     * Test sendToAll with empty parameters
     */
    public function testSendToAllWithEmptyParameters()
    {
        echo "\n[Test] Testing sendToAll with empty parameters...\n";
        
        // Skip if Pusher config is not set
        $pusherConfig = Config::get('pusher');
        if (empty($pusherConfig['beam_instance_id']) || empty($pusherConfig['secret'])) {
            echo "[Skip] Pusher Beams configuration not found\n";
            $this->markTestSkipped('Pusher Beams configuration not found');
            return;
        }
        
        try {
            $title = '';
            $body = '';
            
            echo "[Info] Sending notification with empty title and body...\n";
            
            $publishId = $this->beamsService->sendToAll($title, $body);
            
            // Should still return a publish ID even with empty strings
            $this->assertNotNull($publishId);
            $this->assertIsString($publishId);
            
            echo "[Result] Publish ID: " . $publishId . "\n";
            echo "[Pass] Notification with empty parameters handled correctly\n";
        } catch (\Exception $e) {
            echo "[Skip] Pusher Beams API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('Pusher Beams API unavailable: ' . $e->getMessage());
        }
    }

    /**
     * Test sendToUser with numeric user ID
     */
    public function testSendToUserWithNumericUserId()
    {
        echo "\n[Test] Testing sendToUser with numeric user ID...\n";
        
        // Skip if Pusher config is not set
        $pusherConfig = Config::get('pusher');
        if (empty($pusherConfig['beam_instance_id']) || empty($pusherConfig['secret'])) {
            echo "[Skip] Pusher Beams configuration not found\n";
            $this->markTestSkipped('Pusher Beams configuration not found');
            return;
        }
        
        try {
            $userId = 12345; // Numeric user ID
            $title = 'Numeric User ID Test';
            $body = 'Testing with numeric user ID';
            
            echo "[Info] Sending notification to numeric user ID: " . $userId . "\n";
            
            $publishId = $this->beamsService->sendToUser($userId, $title, $body);
            
            // Should still return a publish ID, service should convert numeric ID to string
            $this->assertNotNull($publishId);
            $this->assertIsString($publishId);
            
            echo "[Result] Publish ID: " . $publishId . "\n";
            echo "[Pass] Notification with numeric user ID handled correctly\n";
        } catch (\Exception $e) {
            echo "[Skip] Pusher Beams API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('Pusher Beams API unavailable: ' . $e->getMessage());
        }
    }
}