<?php

namespace App\Services;

use App\Config\Config;


class FilestackService
{
    private $apiKey;
    private $apiBaseUrl = 'https://www.filestackapi.com/api/store/S3';

    /**
     * @param string $apiKey Your Filestack API Key
     */
    public function __construct()
    {
        $this->apiKey = Config::get('filestack')['api_key'];
    }

    /**
     * Upload a local file to Filestack
     *
     * @param string $filePath The absolute path to the file (e.g. /tmp/phpYzd5)
     * @param string $fileName The name you want the file to have (e.g. video.mp4)
     * @param string $mimeType The mime type (e.g. video/mp4). Optional, but recommended.
     * @return array The Filestack response (url, handle, filename, etc.)
     * @throws Exception If the upload fails
     */
    public function uploadFile($filePath, $fileName, $mimeType = null)
    {
        if (!file_exists($filePath)) {
            throw new \Exception("File not found at path: $filePath");
        }

        // Auto-detect mime type if not provided
        if (!$mimeType) {
            $mimeType = mime_content_type($filePath);
        }

        // Prepare the file for cURL
        $cFile = new \CURLFile($filePath, $mimeType, $fileName);

        // Filestack expects the file in the 'fileUpload' field
        $postData = [
            'fileUpload' => $cFile
        ];

        // Build the URL with the API key
        $endpoint = $this->apiBaseUrl . '?key=' . $this->apiKey;

        // Initialize cURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); // Set false only for local dev debugging

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception("cURL Error: " . $error);
        }

        $result = json_decode($response, true);

        if ($httpCode !== 200 || !isset($result['url'])) {
            // Log the full response for debugging
            $debugMsg = isset($result) ? json_encode($result) : $response;
            throw new \Exception("Filestack API Error (Status $httpCode): " . $debugMsg);
        }

        return $result;
    }

    /**
     * Helper: Generate a Resized Image URL (Transformation)
     * Useful for thumbnails
     */
    public function getResizedUrl($handle, $width, $height)
    {
        return "https://cdn.filestackcontent.com/resize=width:$width,height:$height,fit:clip/$handle";
    }
}