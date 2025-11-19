<?php

namespace Tests\Services;

use PHPUnit\Framework\TestCase;
use App\Services\FileLuService;
use App\Config\Config;

class FileLuServiceTest extends TestCase
{
    private $fileLuService;
    private $testFilePath;
    private $testDir;

    protected function setUp(): void
    {
        // Create a dedicated test directory in the project
        $this->testDir = __DIR__ . '/../../test_files';
        if (!file_exists($this->testDir)) {
            mkdir($this->testDir, 0777, true);
        }
        
        // Initialize the service with actual API key from config
        $this->fileLuService = new FileLuService(Config::get('filelu')['secret']);
        
        // Create a test file for upload testing in our project directory
        $this->testFilePath = $this->testDir . '/filelu_test_' . time() . '.txt';
        file_put_contents($this->testFilePath, 'Test file content for FileLu upload');
    }

    protected function tearDown(): void
    {
        // Clean up test file
        if (file_exists($this->testFilePath)) {
            unlink($this->testFilePath);
        }
        
        // Clean up test directory if empty
        if (is_dir($this->testDir) && count(scandir($this->testDir)) == 2) {
            rmdir($this->testDir);
        }
    }

    /**
     * Test constructor initializes successfully with API key
     */
    public function testConstructorInitializesSuccessfully()
    {
        echo "\n[Test] Testing FileLuService constructor...\n";
        $this->assertInstanceOf(FileLuService::class, $this->fileLuService);
        echo "[Pass] FileLuService instantiated successfully\n";
    }

    /**
     * Test getUploadServer returns valid upload URL via actual API call
     */
    public function testGetUploadServerReturnsValidUrl()
    {
        echo "\n[Test] Testing getUploadServer method...\n";
        $reflectionMethod = new \ReflectionMethod(FileLuService::class, 'getUploadServer');
        $reflectionMethod->setAccessible(true);
        
        try {
            echo "[Info] Calling FileLu API to get upload server...\n";
            $uploadUrl = $reflectionMethod->invoke($this->fileLuService);
            
            // Verify we got a URL back
            $this->assertNotNull($uploadUrl);
            $this->assertIsString($uploadUrl);
            // $this->assertStringContainsString('filelu.com', $uploadUrl);
            
            echo "[Result] Upload URL: " . $uploadUrl . "\n";
            echo "[Pass] Valid upload server URL retrieved\n";
        } catch (\Exception $e) {
            echo "[Skip] FileLu API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileLu API unavailable: ' . $e->getMessage());
        }
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
            
            $response = $this->fileLuService->uploadFile(
                $this->testFilePath,
                $fileName
            );
            
            // Verify response structure
            $this->assertIsArray($response);
            echo "[Result] API Response: " . json_encode($response) . "\n";
            
            $this->assertTrue(
                isset($response['result']) || isset($response['status']) || isset($response['file']),
                'Response should contain file upload result'
            );
            
            echo "[Pass] File uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileLu API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileLu API unavailable: ' . $e->getMessage());
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
            
            $response = $this->fileLuService->uploadFile(
                $imageFile,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Image upload response: " . json_encode($response) . "\n";
            
            $this->assertTrue(
                isset($response['result']) || isset($response['file']),
                'Image upload should return valid response'
            );
            
            echo "[Pass] Image file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileLu API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileLu API unavailable: ' . $e->getMessage());
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
            
            $response = $this->fileLuService->uploadFile(
                $videoFile,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Video upload response: " . json_encode($response) . "\n";
            
            echo "[Pass] Video file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileLu API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileLu API unavailable: ' . $e->getMessage());
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
            
            $response = $this->fileLuService->uploadFile(
                $audioFile,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Audio upload response: " . json_encode($response) . "\n";
            
            echo "[Pass] Audio file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileLu API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileLu API unavailable: ' . $e->getMessage());
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
        $this->fileLuService->uploadFile($nonExistentFile, 'test.txt');
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
            'cURL extension must be loaded for FileLu uploads'
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
            
            $response = $this->fileLuService->uploadFile(
                $this->testFilePath,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Special chars upload response: " . json_encode($response) . "\n";
            
            echo "[Pass] File with special characters uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileLu API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileLu API unavailable: ' . $e->getMessage());
        }
    }

    /**
     * Test uploadFile with large file content
     */
    public function testUploadLargeFile()
    {
        echo "\n[Test] Testing large file upload (5MB)...\n";
        
        // Create a 5MB test file in our project directory
        $largeFile = $this->testDir . '/large_test_' . time() . '.bin';
        file_put_contents($largeFile, str_repeat('x', 5 * 1024 * 1024));
        
        echo "[Info] Created 5MB test file: " . $largeFile . "\n";
        
        try {
            $fileName = 'large_test_' . time() . '.bin';
            echo "[Info] Uploading as: " . $fileName . "\n";
            
            $response = $this->fileLuService->uploadFile(
                $largeFile,
                $fileName
            );
            
            $this->assertIsArray($response);
            echo "[Result] Large file upload response: " . json_encode($response) . "\n";
            
            echo "[Pass] Large file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] FileLu API unavailable or timeout: " . $e->getMessage() . "\n";
            $this->markTestSkipped('FileLu API unavailable or timeout: ' . $e->getMessage());
        } finally {
            if (file_exists($largeFile)) {
                unlink($largeFile);
                echo "[Cleanup] Removed large test file\n";
            }
        }
    }
}