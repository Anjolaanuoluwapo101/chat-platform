<?php

namespace App\Services;

use App\Config\Config;
use Pusher\PushNotifications\PushNotifications;

class Beams
{
    protected $beamsClient;

    public function __construct()
    {
        $this->beamsClient = new PushNotifications([
            'instanceId' => Config::get('pusher')['beam_instance_id'],
            'secretKey'  => Config::get('pusher')['beam_secret_key'],
        ]);
    }

 
    public function sendToAll($channel, $title, $body, $url = null)
    {
        $url = $url ?? Config::get('app')['url'];

        $publishResponse = $this->beamsClient->publishToInterests(
            [$channel],
            [
                'web' => [
                    'notification' => [
                        'title'     => $title,
                        'body'      => $body,
                        'deep_link' => $url,
                    ],
                ],
            ]
        );

        return $publishResponse->publishId;
    }

  
    public function sendToUser($userId, $title, $body, $url = null)
    {
        $url = $url ?? Config::get('app')['url'];
        
        $publishResponse = $this->beamsClient->publishToUsers(
            [(string)$userId], // Array of User IDs (must be strings)
            [
                'web' => [
                    'notification' => [
                        'title'     => $title,
                        'body'      => $body,
                        'deep_link' => $url,
                    ],
                ],
            ]
        );

        return $publishResponse->publishId;
    }
}