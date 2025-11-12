<?php

namespace App\Config;

use PHPMailer\PHPMailer\PHPMailer;
use Dotenv\Dotenv;

class Config
{
    private static $dotenv = null;
    
    private static function loadEnv()
    {
        if (self::$dotenv === null) {
            // Load .env file
            self::$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
            self::$dotenv->load();
        }
    }
    
    public static function get($key)
    {
        // Load environment variables
        self::loadEnv();
        
        $config = [
            // default database driver: 'sqlite', 'mysql' or 'redis'
            'database_driver' => $_ENV['DATABASE_DRIVER'] ?? 'redis',
            // redis / upstash config
            'redis' => [
                'url' => "rediss://default:AYprAAIncDE2MDYyODYwMzk3YmU0NjJlOWVjODZkZjk3NmQ0OGMzYXAxMzU0MzU@flexible-condor-35435.upstash.io:6379",
                'password' => $_ENV['REDIS_PASSWORD'] ?? null,
            ],
            // for sqlite
            'database' => [
                'path' => __DIR__ . '/../../database/secretville.db',
            ],
            // for mysql
            'mysql' => [
                'host' => $_ENV['MYSQL_HOST'] ?? 'localhost',
                'dbname' => $_ENV['MYSQL_DBNAME'] ?? 'secretville',
                'username' => $_ENV['MYSQL_USERNAME'] ?? 'root',
                'password' => $_ENV['MYSQL_PASSWORD'] ?? '',
                'port' => $_ENV['MYSQL_PORT'] ?? 3306,
            ],
            'app' => [
                'name' => $_ENV['APP_NAME'] ?? 'Secret Ville',
                'url' => $_ENV['APP_URL'] ?? 'http://localhost/anonymous-website',
            ],
            'mail' => [
                'from' => $_ENV['MAIL_FROM'] ?? 'noreply@secretville.com',
                'smtp_host' => $_ENV['MAIL_SMTP_HOST'] ?? 'smtp.gmail.com',
                'smtp_username' => $_ENV['MAIL_SMTP_USERNAME'] ?? 'anjolaakinsoyinu@gmail.com',
                'smtp_password' => $_ENV['MAIL_SMTP_PASSWORD'] ?? 'lmsyoeseknskcmdi',
                'smtp_secure' => $_ENV['MAIL_SMTP_SECURE'] ?? PHPMailer::ENCRYPTION_SMTPS,
                'smtp_port' => $_ENV['MAIL_SMTP_PORT'] ?? 465,
            ],
            'pusher' => [
                'app_id' => $_ENV['PUSHER_APP_ID'] ?? '1678820',
                'key' => $_ENV['PUSHER_APP_KEY'] ?? '7e136cd2a9797c421ac1',
                'secret' => $_ENV['PUSHER_APP_SECRET'] ?? '8998ff663690c6c06322',
                'cluster' => $_ENV['PUSHER_APP_CLUSTER'] ?? 'eu',
            ],
            'jwt' => [
                'secret' => $_ENV['JWT_SECRET'] ?? 'mannitol-salt-agar',
            ],
        ];

        return $config[$key] ?? null;
    }
}