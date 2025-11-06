<?php

namespace App\Config;

use PHPMailer\PHPMailer\PHPMailer;

class Config
{
    public static function get($key)
    {
        $config = [
            // default database driver: 'sqlite' or 'redis'
            'database_driver' => getenv('DATABASE_DRIVER') ?: 'redis',
            // redis / upstash config
            'redis' => [
                'url' => "rediss://default:AYprAAIncDE2MDYyODYwMzk3YmU0NjJlOWVjODZkZjk3NmQ0OGMzYXAxMzU0MzU@flexible-condor-35435.upstash.io:6379",
                'password' => getenv('REDIS_PASSWORD') ?: null,
            ],
            //for sqlite
            'database' => [
                'path' => __DIR__ . '/../database/secretville.db',
            ],
            'app' => [
                'name' => 'Secret Ville',
                'url' => 'http://localhost/anonymous-website',
            ],
            'mail' => [
                'from' => 'noreply@secretville.com',
                'smtp_host' => 'smtp.gmail.com', // Update with your SMTP host
                'smtp_username' => 'anjolaakinsoyinu@gmail.com', // Update with your email
                'smtp_password' => 'lmsyoeseknskcmdi', // Update with your app password
                'smtp_secure' => PHPMailer::ENCRYPTION_SMTPS,
                'smtp_port' => 465,
            ],
            'pusher' => [
                'app_id' => '1678820',
                'key' => '7e136cd2a9797c421ac1',
                'secret' => '8998ff663690c6c06322',
                'cluster' => 'eu',
            ],
            'jwt' => [
                'secret' => 'mannitol-salt-agar',
            ],
        ];

        return $config[$key] ?? null;
    }
}
