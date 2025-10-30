<?php

namespace App\Models;

use App\Factory\DatabaseFactory;

class Message
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseFactory::create('sqlite');
    }

    public function getMessages($username)
    {
        return $this->db->getMessages($username);
    }

    public function saveMessage($username, $text, $time)
    {
        $message = [
            'username' => $username,
            'content' => htmlspecialchars($text),
            'time' => $time,
        ];
        $this->db->saveMessage($message);
    }
}
