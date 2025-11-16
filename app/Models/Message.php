<?php

namespace App\Models;

use App\Factory\DatabaseFactory;
use App\Log\Logger;


class Message
{
    private $db;
    private $logger;


    public function __construct()
    {
        $this->logger = new Logger;
        $this->db = DatabaseFactory::createDefault();
    }

    public function getMessages($username)
    {
        return $this->db->getMessages($username);
    }

    public function saveMessage($username, $text, $time, $mediaUrls = [], $groupId = null, $replyToMessageId = null,  $parentMessageData = null )
    {
        $message = [
            'username' => $username,
            'content' => htmlspecialchars($text),
            'time' => $time,
            'group_id' => $groupId,
            'media_urls' => $mediaUrls ?? [],
            'reply_to_message_id' => $replyToMessageId,
            'parent_message_data' => $parentMessageData
        ];
        try {
            // return var_dump($message);
            $messageId = $this->db->saveMessage($message);

            return $messageId;
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());
            return false;
        }
    }
}
