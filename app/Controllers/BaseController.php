<?php

namespace App\Controllers;

use App\Factory\StorageFactory;
use App\Factory\DatabaseFactory;
use App\Services\AuthService;


class BaseController
{
    /**
     * Database instance according to configured driver.
     */
    protected $db;
    protected $authService;
    protected $user;
    protected $userId;
    public function __construct()
    {
        $this->authService = new AuthService();
        
        // Create configured database instance for controllers to use
        $this->db = \App\Factory\DatabaseFactory::createDefault();


    }

    /**
     * Set CORS headers to allow requests from React frontend.
     */
    // private function setCorsHeaders()
    // {
    //     header('Access-Control-Allow-Origin: *'); // React dev server
    //     header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    //     header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    //     header('Access-Control-Allow-Credentials: true');

    //     // Handle preflight OPTIONS request
    //     if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    //         http_response_code(200);
    //         exit;
    //     }
    // }

    /**
     * Render a view (for backward compatibility, but we'll phase this out).
     */
    protected function render($view, $data = [])
    {
        extract($data);
        include __DIR__ . "/../../views/$view.php";
    }

    /**
     * Return JSON response.
     */
    protected function jsonResponse($data, $statusCode = 200)
    {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }

    /**
     * Redirect (for backward compatibility).
     */
    protected function redirect($url)
    {
        header("Location: $url");
        exit;
    }

    /**
     * Check if request is AJAX or API call.
     */
    protected function isAjax()
    {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }

    /**
     * Get Bearer token from Authorization header.
     */
    protected function getBearerToken()
    {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    /**
     * Authenticate user 
     */
    protected function authenticateUser()
    {
        if (!isset($this->authService)) {
            $this->authService = new AuthService();
        }
        $user = $this->checkAuth(); // Use the new method from BaseController
        if ($user == null){
            // Authentication failed - return 401
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return null;
        }
        // Set user property for convenience
        $this->user = $user;
        $this->userId = $user['id'];

        return $user;
    }

    /**
     * Check if user is authenticated via session (without returning error).
     * Used for checking authentication state without forcing login.
     */
    protected function checkAuth()
    {
        $authService = new AuthService();
        return $authService->authenticateFromSession();
    }

    /**
     * Process uploaded files and return media URLs
     * Shared method for all controllers that handle file uploads
     */
    protected function processUploadedFiles()
    {
        $storage = StorageFactory::create('r2');
        $mediaUrls = [];
        $errors = [];

        if (isset($_FILES['media']) && is_array($_FILES['media']['name'])) {
            $files = $_FILES['media'];
            $fileCount = count($files['name']);

            for ($i = 0; $i < $fileCount; $i++) {
                $file = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i],
                ];

                if ($file['error'] === 0) {
                    $mediaUrl = $storage->store($file);
                    if ($mediaUrl) {
                        $mediaUrls[] = $mediaUrl;
                    } else {
                        $errors[] = 'Failed to store media file: ' . $file['name'];
                    }
                } else {
                    $errors[] = 'Upload error for ' . $file['name'] . ': ' . $file['error'];
                }
            }
        }

        return [
            'mediaUrls' => $mediaUrls,
            'errors' => $errors
        ];
    }

    /**
     * Save media metadata to the appropriate database table based on MIME type
     * 
     * @param int $messageId The ID of the message the media is associated with
     * @param string $filePath The path to the media file
     * @param string $mimeType The MIME type of the media file
     * @return bool True if saved successfully, false otherwise
     */
    protected function saveMediaMetadata($messageId, $filePath, $mimeType)
    {
        // Get database instance
        $db = DatabaseFactory::createDefault();

        // Prepare media data
        $mediaData = [
            'message_id' => $messageId,
            'file_path' => $filePath,
            'mime_type' => $mimeType
        ];

        // Determine which table to save to based on MIME type
        if (strpos($mimeType, 'image') === 0) {
            // Save to photos table
            return $db->savePhoto($mediaData);
        } elseif (strpos($mimeType, 'video') === 0) {
            // Save to videos table
            return $db->saveVideo($mediaData);
        } elseif (strpos($mimeType, 'audio') === 0) {
            // Save to audio table
            return $db->saveAudio($mediaData);
        }

        // If MIME type doesn't match any category, we don't save it to a specific table
        return true;
    }
}