<?php

namespace App\Services;

class LocalStorageAdapter
{
    private $uploadDir = '../public/uploads';

    public function store($file)
    {
        // Determine the subdirectory based on MIME type
        $mimeType = mime_content_type($file['tmp_name']);
        $subDir = '';
        if (strpos($mimeType, 'image') === 0) {
            $subDir = 'images';
        } elseif (strpos($mimeType, 'video') === 0) {
            $subDir = 'videos';
        } elseif (strpos($mimeType, 'audio') === 0) {
            $subDir = 'audios';
        } else {
            $subDir = 'others'; // Fallback for unknown types
        }

        // Create the subdirectory if it doesn't exist
        $fullDir = $this->uploadDir . '/' . $subDir;
        if (!is_dir($fullDir)) {
            mkdir($fullDir, 0755, true);
        }

        $filename = uniqid() . '_' . $file['name'];
        $destination = $fullDir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            // Return the path relative to the public directory
            return 'uploads/' . $subDir . '/' . $filename;
        }

        return false;
    }
}
