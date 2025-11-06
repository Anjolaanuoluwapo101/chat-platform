<?php

namespace App\Models;

use App\Factory\DatabaseFactory;
use App\Log\Logger;

class Audio
{
    public $id;
    public $message_id;
    public $file_path;
    public $mime_type;
    public $created_at;

    private $db;

    private $logger;

    public function __construct($message_id = null, $file_path = null, $mime_type = null, $created_at = null)
    {
        // $this->id = $id;
        $this->message_id = $message_id;
        $this->file_path = $file_path;
        $this->mime_type = $mime_type;
        $this->created_at = $created_at;
    $this->db = DatabaseFactory::createDefault();
        $this->logger = new Logger;
    }

    public function save()
    {
        try {
            $media = [
                'message_id' => $this->message_id,
                'file_path' => $this->file_path,
                'mime_type' => $this->mime_type,
            ];
            return $this->db->saveAudio($media);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());
            return false;
        }
    }

    public static function getByMessageId($messageId)
    {
        try {
            $db = DatabaseFactory::createDefault();
            return $db->getAudios($messageId);
        } catch (\Exception $e) {
            (new Logger)->error($e->getMessage());
            return false;
        }
    }
}
