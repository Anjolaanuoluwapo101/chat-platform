<?php

namespace App\Models;

use App\Factory\DatabaseFactory;

class Group
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseFactory::create('sqlite');
    }

    public function create($name)
    {
        return $this->db->createGroup($name);
    }

    public function addMember($groupId, $userId)
    {
        return $this->db->addGroupMember($groupId, $userId);
    }

    public function isMember($groupId, $userId)
    {
        return $this->db->isUserInGroup($groupId, $userId);
    }

    public function get($groupId)
    {
        return $this->db->getGroup($groupId);
    }
}
