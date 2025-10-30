<?php

namespace App\Database;

use App\Database\DatabaseInterface;
use App\Config\Config;
use Predis\Client;

class RedisDatabase implements DatabaseInterface
{
    private $client;

    public function __construct()
    {
        $this->connect();
    }

    public function connect()
    {
        $config = Config::get('redis');
        $this->client = new Client([
            'host' => $config['host'],
            'port' => $config['port'],
            'password' => $config['password'],
        ]);
    }

    public function getUser($username)
    {
        $userData = $this->client->hgetall("user:$username");
        return $userData ? $userData : null;
    }

    public function saveUser($user)
    {
        $this->client->hmset("user:{$user['username']}", $user);
    }

    public function getMessages($username)
    {
        $messages = $this->client->lrange("messages:$username", 0, -1);
        return array_map('json_decode', $messages);
    }

    public function saveMessage($message)
    {
        $this->client->lpush("messages:{$message['username']}", json_encode($message));
    }

    public function updateUser($username, $data)
    {
        $this->client->hmset("user:$username", $data);
    }
}
