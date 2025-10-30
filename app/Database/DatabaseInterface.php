<?php

namespace App\Database;

interface DatabaseInterface
{
    public function connect();
    public function getUser($username);
    public function saveUser($user);
    public function getMessages($username);
    public function saveMessage($message);
    public function updateUser($username, $data);
}
