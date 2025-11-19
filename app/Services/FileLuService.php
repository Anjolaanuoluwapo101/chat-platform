<?php

namespace App\Services;

use App\Config\Config;

class FileLuService
{
    private $apiKey;
    // FileLu usually requires checking for a valid upload server first
    private $serverUrl = 'https://filelu.com/api/upload/server'; 
    
    public function __construct($apiKey)
    {
        $this->apiKey = Config::get('filelu')['secret'];
    }

    /*
     */
    private function getUploadServer()
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->serverUrl . '?key=' . $this->apiKey);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);

        if (isset($data['result'])) {
            return $data['result']; // The actual URL to POST the file to
        }

        throw new \Exception("Could not retrieve FileLu upload server.");
    }

    /**
     * Step 2: Upload the actual file
     */
    public function uploadFile($filePath, $fileName)
    {
        // 1. Get the target server
        $uploadUrl = $this->getUploadServer();

        // 2. Prepare the file for cURL
        $cFile = new \CURLFile($filePath, mime_content_type($filePath), $fileName);

        $postData = [
            'sess_id' => '', // Usually optional or part of the URL
            'utype' => 'reg', // or 'reg' if you want it linked to your account
            'file_0' => $cFile,
            'key' => $this->apiKey,
            'json' => 1 // Ensure we get a JSON response
        ];

        // 3. Execute Upload
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $uploadUrl);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        
        if (curl_errno($ch)) {
            throw new \Exception('cURL Error: ' . curl_error($ch));
        }
        
        curl_close($ch);
        
        return json_decode($response, true);
    }
}