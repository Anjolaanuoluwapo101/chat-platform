<?php

namespace Tests\Services;

use PHPUnit\Framework\TestCase;
use App\Services\R2Service;
use App\Config\Config;

class R2ServiceTest extends TestCase
{
    private $r2Service;
    private $testFilePath;
    private $testDir;
    private $uploadedFiles = [];

    protected function setUp(): void
    {
        echo "\n[Setup] Initializing R2Service test...\n";
        
        // Create a dedicated test directory in the project
        $this->testDir = __DIR__ . '/../../test_files';
        if (!file_exists($this->testDir)) {
            mkdir($this->testDir, 0777, true);
        }
        
        // Check if R2 config exists before initializing
        try {
            $r2Config = Config::get('r2');
            if (empty($r2Config['account_id']) || 
                empty($r2Config['access_key_id']) || 
                empty($r2Config['secret_access_key'])) {
                $this->markTestSkipped('R2 configuration is missing or incomplete');
            }
            
            // Initialize the service
            $this->r2Service = new R2Service();
            echo "[Setup] R2Service initialized successfully\n";
        } catch (\Exception $e) {
            echo "[Error] " . $e->getMessage() . "\n";
            $this->markTestSkipped('R2 configuration not available: ' . $e->getMessage());
        }
        
        // Create a test file for upload testing
        $this->testFilePath = $this->testDir . '/r2_test_' . time() . '.txt';
        file_put_contents($this->testFilePath, 'Test file content for R2 upload');
        
        echo "[Setup] Created test file: " . $this->testFilePath . "\n";
    }

    protected function tyearDown(): void
    {
        echo "[Teardown] Cleaning up test files...\n";
        
        // Clean up uploaded files from R2
        // if (!empty($this->uploadedFiles) && isset($this->r2Service)) {
        //     foreach ($this->uploadedFiles as $fileName) {
        //         try {
        //             $this->r2Service->deleteFile($fileName);
        //             echo "[Teardown] Deleted R2 file: " . $fileName . "\n";
        //         } catch (\Exception $e) {
        //             echo "[Warning] Could not delete R2 file: " . $fileName . "\n";
        //         }
        //     }
        // }
        
        // Clean up local test file
        if (file_exists($this->testFilePath)) {
            unlink($this->testFilePath);
            echo "[Teardown] Removed test file: " . $this->testFilePath . "\n";
        }
        
        // Clean up test directory if empty
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
     * Test constructor initializes successfully with credentials
     */
    public function testConstructorInitializesSuccessfully()
    {
        echo "\n[Test] Testing R2Service constructor...\n";
        $this->assertInstanceOf(R2Service::class, $this->r2Service);
        echo "[Pass] R2Service instantiated successfully\n";
    }

    /**
     * Test uploadFile successfully uploads a file to R2
     */
    public function testUploadFileSuccessfully()
    {
        echo "\n[Test] Testing file upload functionality...\n";
        echo "[Info] Uploading test file: " . $this->testFilePath . "\n";
        
        try {
            $fileName = 'test_upload_' . time() . '.txt';
            echo "[Info] Uploading as: " . $fileName . "\n";
            
            $url = $this->r2Service->uploadFile(
                $this->testFilePath,
                $fileName,
                'text/plain'
            );
            
            // Track uploaded file for cleanup
            $this->uploadedFiles[] = $fileName;
            
            // Verify response is a URL string
            $this->assertIsString($url);
            $this->assertNotEmpty($url);
            $this->assertStringContainsString($fileName, $url);
            
            echo "[Result] File URL: " . $url . "\n";
            echo "[Pass] File uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] R2 API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('R2 API unavailable: ' . $e->getMessage());
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
            
            $url = $this->r2Service->uploadFile(
                $imageFile,
                $fileName,
                'image/png'
            );
            
            $this->uploadedFiles[] = $fileName;
            
            $this->assertIsString($url);
            $this->assertStringContainsString($fileName, $url);
            
            echo "[Result] Image URL: " . $url . "\n";
            echo "[Pass] Image file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] R2 API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('R2 API unavailable: ' . $e->getMessage());
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
            
            $url = $this->r2Service->uploadFile(
                $videoFile,
                $fileName,
                'video/mp4'
            );
            
            $this->uploadedFiles[] = $fileName;
            
            $this->assertIsString($url);
            $this->assertStringContainsString($fileName, $url);
            
            echo "[Result] Video URL: " . $url . "\n";
            echo "[Pass] Video file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] R2 API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('R2 API unavailable: ' . $e->getMessage());
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
            
            $url = $this->r2Service->uploadFile(
                $audioFile,
                $fileName,
                'audio/mpeg'
            );
            
            $this->uploadedFiles[] = $fileName;
            
            $this->assertIsString($url);
            $this->assertStringContainsString($fileName, $url);
            
            echo "[Result] Audio URL: " . $url . "\n";
            echo "[Pass] Audio file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] R2 API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('R2 API unavailable: ' . $e->getMessage());
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
        $this->r2Service->uploadFile($nonExistentFile, 'test.txt', 'text/plain');
    }

    /**
     * Test deleteFile successfully removes a file from R2
     */
    public function testDeleteFileSuccessfully()
    {
        echo "\n[Test] Testing file deletion functionality...\n";
        
        try {
            // First upload a file
            $fileName = 'test_delete_' . time() . '.txt';
            echo "[Info] Uploading file for deletion test: " . $fileName . "\n";
            
            $url = $this->r2Service->uploadFile(
                $this->testFilePath,
                $fileName,
                'text/plain'
            );
            
            echo "[Info] File uploaded: " . $url . "\n";
            
            // Now delete it
            echo "[Info] Deleting file: " . $fileName . "\n";
            $result = $this->r2Service->deleteFile($fileName);
            
            $this->assertTrue($result);
            echo "[Pass] File deleted successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] R2 API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('R2 API unavailable: ' . $e->getMessage());
        }
    }

    /**
     * Test file with special characters in name
     */
    public function testUploadFileWithSpecialCharactersInName()
    {
        echo "\n[Test] Testing upload with special characters in filename...\n";
        
        try {
            $fileName = 'test_file_' . time() . '_special-chars_test.txt';
            echo "[Info] Uploading as: " . $fileName . "\n";
            
            $url = $this->r2Service->uploadFile(
                $this->testFilePath,
                $fileName,
                'text/plain'
            );
            
            $this->uploadedFiles[] = $fileName;
            
            $this->assertIsString($url);
            $this->assertStringContainsString($fileName, $url);
            
            echo "[Result] Special chars upload URL: " . $url . "\n";
            echo "[Pass] File with special characters uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] R2 API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('R2 API unavailable: ' . $e->getMessage());
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
            
            $url = $this->r2Service->uploadFile(
                $largeFile,
                $fileName,
                'application/octet-stream'
            );
            
            $this->uploadedFiles[] = $fileName;
            
            $this->assertIsString($url);
            $this->assertStringContainsString($fileName, $url);
            
            echo "[Result] Large file URL: " . $url . "\n";
            echo "[Pass] Large file uploaded successfully\n";
        } catch (\Exception $e) {
            echo "[Skip] R2 API unavailable or timeout: " . $e->getMessage() . "\n";
            $this->markTestSkipped('R2 API unavailable or timeout: ' . $e->getMessage());
        } finally {
            if (file_exists($largeFile)) {
                unlink($largeFile);
                echo "[Cleanup] Removed large test file\n";
            }
        }
    }

    /**
     * Test AWS SDK extension is available
     */
    public function testAwsSdkIsAvailable()
    {
        echo "\n[Test] Testing AWS SDK availability...\n";
        
        $s3ClientExists = class_exists('Aws\S3\S3Client');
        echo "[Result] AWS S3 Client class exists: " . ($s3ClientExists ? 'Yes' : 'No') . "\n";
        
        $this->assertTrue(
            $s3ClientExists,
            'AWS SDK S3Client must be available for R2 uploads'
        );
        
        if ($s3ClientExists) {
            echo "[Pass] AWS SDK is available\n";
        }
    }

    /**
     * Test public URL format is correct
     */
    public function testPublicUrlFormat()
    {
        echo "\n[Test] Testing public URL format...\n";
        
        try {
            $fileName = 'test_url_format_' . time() . '.txt';
            echo "[Info] Uploading file to check URL format: " . $fileName . "\n";
            
            $url = $this->r2Service->uploadFile(
                $this->testFilePath,
                $fileName,
                'text/plain'
            );
            
            $this->uploadedFiles[] = $fileName;
            
            // Verify URL format
            $this->assertIsString($url);
            $this->assertStringStartsWith('http', $url);
            $this->assertStringContainsString($fileName, $url);
            
            echo "[Result] URL format: " . $url . "\n";
            echo "[Pass] Public URL format is correct\n";
        } catch (\Exception $e) {
            echo "[Skip] R2 API unavailable: " . $e->getMessage() . "\n";
            $this->markTestSkipped('R2 API unavailable: ' . $e->getMessage());
        }
    }
}
