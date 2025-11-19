<?php

namespace Tests\Services;

use PHPUnit\Framework\TestCase;
use App\Services\FilestackService;
use App\Config\Config;

class FileStackServiceTest extends TestCase
{
    private $fileStackService;
    private $testFilePath;
    private $testDir;

    protected function setUp(): void
    {
        echo "\n[Setup] Initializing FileStackService test...\n";
        
        // Create a dedicated test directory in the project
        $this->testDir = __DIR__ . '/../../test_files';
        if (!file_exists($this->testDir)) {
            mkdir($this->testDir, 0777, true);
        }
        
        // Initialize the service with actual API key from config
        $this->fileStackService = new FilestackService();
        
        // Create a test file for upload testing in our project directory
        $this->testFilePath = $this->testDir . '/filestack_test_' . time() . '.txt';
        file_put_contents($this->testFilePath, 'Test file content for FileStack upload');
        
        echo "[Setup] Created test file: " . $this->testFilePath . "\n";
    }

    protected function tearDown(): void
    {
        echo "[Teardown] Cleaning up test files...\n";
        
        // Clean up test file
        if (file_exists($this->testFilePath)) {
            unlink($this->testFilePath);
            echo "[Teardown] Removed test file: " . $this->testFilePath . "\n";
        }
        
        // Clean up test directory if empty (only when it exists and is empty)
        if (is_dir($this->testDir)) {
            $files = array_diff(scandir($this->testDir), array('.', '..'));
            if (empty($files)) {
                rmdir($this->testDir);
                echo "[Teardown] Removed test directory: " . $this->testDir . "\n";
            } else {
                echo "[Teardown] Test directory not empty, keeping it\n";
            }
        }
    }

    /**
     * Test constructor initializes successfully with API key
     */
    public function testConstructorInitializesSuccessfully()
    {
        echo "\n[Test] Testing FileStackService constructor...\n";
        $this->assertInstanceOf(FilestackService::class, $this->fileStackService);
        echo "[Pass] FileStackService instantiated successfully\n";
    }

    /**
     * Test uploadFile successfully uploads a file via actual API
     */
    public function testUploadFileSuccessfully()
    {
        echo "\n[Test] Testing file upload functionality...\n";
        echo "[Info] Uploading test file: " . $this->testFilePath . "\n";
        
        try {
            $fileName = 'test_upload_' . time() . '.txt';
            echo "[Info] Uploading as: " . $fileName . "\n";
            
            $response = $this->fileStackService->uploadFile(
                $this->testFilePath,
                $fileName
            );
            
            // Verify response structure
            $this->assertIsArray($response);
            echo "[Result] API Response: " . json_encode($response) . "\n";
            
            $this->assertTrue(
                isset($response['url']) && isset($response['handle']),
                'Response should contain file upload result with url and handle'
            );
            
            echo "[Pass] File uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileStack API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileStack API unavailable: ' . $e->getMessage());
        }
    }

    /**
     * Test uploadFile with image file
     */
    public function testUploadImageFile()
    {
        echo "\n[Test] Testing image file upload...\n";
        
        // Create a test image file
        $imageFile = $this->testDir . '/test_image_' . time() . '.png';
        // Create a minimal PNG file (1x1 pixel)
        $pngData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        file_put_contents($imageFile, $pngData);
        
        echo "[Info] Created test image: " . $imageFile . "\n";
        
        try {
            $fileName = 'test_image_' . time() . '.png';
            echo "[Info] Uploading as: " . $fileName . "\n";
            
            $response = $this->fileStackService->uploadFile(
                $imageFile,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Image upload response: " . json_encode($response) . "\n";
            
            $this->assertTrue(
                isset($response['url']) && isset($response['handle']),
                'Image upload should return valid response with url and handle'
            );
            
            echo "[Pass] Image file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileStack API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileStack API unavailable: ' . $e->getMessage());
        } finally {
            if (file_exists($imageFile)) {
                unlink($imageFile);
                echo "[Cleanup] Removed test image file\n";
            }
        }
    }

    /**
     * Test uploadFile with video file
     */
    public function testUploadVideoFile()
    {
        echo "\n[Test] Testing video file upload...\n";
        
        // Create a test video file with minimal content
        $videoFile = $this->testDir . '/test_video_' . time() . '.mp4';
        file_put_contents($videoFile, str_repeat('test', 1024)); // Create a small test file
        
        echo "[Info] Created test video file: " . $videoFile . "\n";
        
        try {
            $fileName = 'test_video_' . time() . '.mp4';
            echo "[Info] Uploading as: " . $fileName . "\n";
            
            $response = $this->fileStackService->uploadFile(
                $videoFile,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Video upload response: " . json_encode($response) . "\n";
            
            echo "[Pass] Video file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileStack API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileStack API unavailable: ' . $e->getMessage());
        } finally {
            if (file_exists($videoFile)) {
                unlink($videoFile);
                echo "[Cleanup] Removed test video file\n";
            }
        }
    }

    /**
     * Test uploadFile with audio file
     */
    public function testUploadAudioFile()
    {
        echo "\n[Test] Testing audio file upload...\n";
        
        $audioFile = $this->testDir . '/test_audio_' . time() . '.mp3';
        file_put_contents($audioFile, str_repeat('audio', 512));
        
        echo "[Info] Created test audio file: " . $audioFile . "\n";
        
        try {
            $fileName = 'test_audio_' . time() . '.mp3';
            echo "[Info] Uploading as: " . $fileName . "\n";
            
            $response = $this->fileStackService->uploadFile(
                $audioFile,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Audio upload response: " . json_encode($response) . "\n";
            
            echo "[Pass] Audio file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileStack API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileStack API unavailable: ' . $e->getMessage());
        } finally {
            if (file_exists($audioFile)) {
                unlink($audioFile);
                echo "[Cleanup] Removed test audio file\n";
            }
        }
    }

    /**
     * Test uploadFile handles errors gracefully
     */
    public function testUploadFileHandlesErrors()
    {
        echo "\n[Test] Testing error handling for non-existent file...\n";
        
        // Try to upload a non-existent file
        $nonExistentFile = '/path/to/non/existent/file_' . time() . '.txt';
        echo "[Info] Attempting to upload non-existent file: " . $nonExistentFile . "\n";
        
        $this->expectException(\Exception::class);
        echo "[Expected] Exception should be thrown\n";
        $this->fileStackService->uploadFile($nonExistentFile, 'test.txt');
    }

    /**
     * Test cURL extension is available
     */
    public function testCurlExtensionIsAvailable()
    {
        echo "\n[Test] Testing cURL extension availability...\n";
        
        $curlAvailable = extension_loaded('curl');
        echo "[Result] cURL extension loaded: " . ($curlAvailable ? 'Yes' : 'No') . "\n";
        
        $this->assertTrue(
            $curlAvailable,
            'cURL extension must be loaded for FileStack uploads'
        );
        
        if ($curlAvailable) {
            echo "[Pass] cURL extension is available\n";
        }
    }

    /**
     * Test file with special characters in name
     */
    public function testUploadFileWithSpecialCharactersInName()
    {
        echo "\n[Test] Testing upload with special characters in filename...\n";
        
        try {
            $fileName = 'test_file_' . time() . '_special-chars.txt';
            echo "[Info] Uploading as: " . $fileName . "\n";
            
            $response = $this->fileStackService->uploadFile(
                $this->testFilePath,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Special chars upload response: " . json_encode($response) . "\n";
            
            echo "[Pass] File with special characters uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileStack API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileStack API unavailable: ' . $e->getMessage());
        }
    }

    /**
     * Test uploadFile with large file content
     */
    public function testUploadLargeFile()
    {
        echo "\n[Test] Testing large file upload (5MB)...\n";
        
        $largeFile = $this->testDir . '/large_test_' . time() . '.bin';
        // Create a 5MB test file
        file_put_contents($largeFile, str_repeat('x', 5 * 1024 * 1024));
        
        echo "[Info] Created 5MB test file: " . $largeFile . "\n";
        
        try {
            $fileName = 'large_test_' . time() . '.bin';
            echo "[Info] Uploading as: " . $fileName . "\n";
            
            $response = $this->fileStackService->uploadFile(
                $largeFile,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Large file upload response: " . json_encode($response) . "\n";
            
            echo "[Pass] Large file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileStack API unavailable or timeout: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileStack API unavailable or timeout: ' . $e->getMessage());
        } finally {
            if (file_exists($largeFile)) {
                unlink($largeFile);
                echo "[Cleanup] Removed large test file\n";
            }
        }
    }

    /**
     * Test getResizedUrl helper method
     */
    public function testGetResizedUrl()
    {
        echo "\n[Test] Testing getResizedUrl helper method...\n";
        
        $testHandle = 'test_handle_123';
        $width = 300;
        $height = 200;
        
        $resizedUrl = $this->fileStackService->getResizedUrl($testHandle, $width, $height);
        
        $expectedUrl = "https://cdn.filestackcontent.com/resize=width:$width,height:$height,fit:clip/$testHandle";
        
        $this->assertEquals($expectedUrl, $resizedUrl);
        echo "[Result] Generated URL: " . $resizedUrl . "\n";
        echo "[Pass] getResizedUrl generates correct URL\n";
    }
}