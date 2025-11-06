<?php

namespace App\Models;

use App\Factory\DatabaseFactory;

class GroupMember
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseFactory::createDefault();
    }

    public function add($groupId, $userId)
    {
        return $this->db->addGroupMember($groupId, $userId);
    }

    public function isMember($groupId, $userId)
    {
        return $this->db->isUserInGroup($groupId, $userId);
    }
}
