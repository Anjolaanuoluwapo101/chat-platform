<?php

namespace App\Models;

use App\Factory\DatabaseFactory;
use App\Log\Logger;
use App\Models\Photo;
use App\Models\Video;
use App\Models\Audio;

class Message
{
    private $db;
    private $logger;


    public function __construct()
    {
        $this->logger = new Logger;
        $this->db = DatabaseFactory::create('sqlite');
    }

    public function getMessages($username)
    {
        return $this->db->getMessages($username);
    }

    public function saveMessage($username, $text, $time, $mediaUrls = [], $groupId = null)
    {
        $message = [
            'username' => $username,
            'content' => htmlspecialchars($text),
            'time' => $time,
            'group_id' => $groupId,
        ];
        try {
            $messageId = $this->db->saveMessage($message);

            // Save media URLs
            foreach ($mediaUrls as $mediaUrl) {
                $mimeType = mime_content_type($mediaUrl);

                if (strpos($mimeType, 'image') !== false) {
                    $photo = new Photo($messageId, $mediaUrl, $mimeType);
                    $photo->save();
                } elseif (strpos($mimeType, 'video') !== false) {
                    $video = new Video($messageId, $mediaUrl, $mimeType);
                    $video->save();
                } elseif (strpos($mimeType, 'audio') !== false) {
                    $audio = new Audio($messageId, $mediaUrl, $mimeType);
                    $audio->save();
                }
            }

            return $messageId;
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());
            return false;
        }
    }

    /**
     * Get messages for a group.
     *
     * @param int $groupId
     * @return array
     */
    
}
