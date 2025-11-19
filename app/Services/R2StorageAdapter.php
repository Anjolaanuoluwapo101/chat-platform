<?php

namespace App\Services;

class R2StorageAdapter
{
    private $r2Service;

    public function __construct()
    {
        $this->r2Service = new R2Service();
    }

    public function store($file)
    {
        // Determine MIME type
        $mimeType = mime_content_type($file['tmp_name']);
        
        // Determine subdirectory based on MIME type (for organized naming)
        $subDir = '';
        if (strpos($mimeType, 'image') === 0) {
            $subDir = 'images';
        } elseif (strpos($mimeType, 'video') === 0) {
            $subDir = 'videos';
        } elseif (strpos($mimeType, 'audio') === 0) {
            $subDir = 'audios';
        } else {
            $subDir = 'others';
        }

        // Create unique filename with subdirectory prefix for organization
        $filename = $subDir . '/' . uniqid() . '_' . $file['name'];

        // Upload to R2
        $url = $this->r2Service->uploadFile(
            $file['tmp_name'],
            $filename,
            $mimeType
        );

        // Return the full URL (R2Service returns the public URL)
        return $url;
    }
}
