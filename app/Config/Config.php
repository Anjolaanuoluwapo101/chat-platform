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
        // self::loadEnv();
        
        $config = [
            // default database driver: 'sqlite', 'mysql' or 'redis'
            'database_driver' => getenv('DATABASE_DRIVER') ?: 'redis',
            // redis / upstash config
            'redis' => [
                'url' => "rediss://default:AYprAAIncDE2MDYyODYwMzk3YmU0NjJlOWVjODZkZjk3NmQ0OGMzYXAxMzU0MzU@flexible-condor-35435.upstash.io:6379",
                'password' => getenv('REDIS_PASSWORD') ?: null,
            ],
            // for sqlite
            'database' => [
                'path' => __DIR__ . '/../../database/secretville.db',
            ],
            // for mysql
            'mysql' => [
                'host' => getenv('MYSQL_HOST') ?: 'localhost',
                'dbname' => getenv('MYSQL_DBNAME') ?: 'secretville',
                'username' => getenv('MYSQL_USERNAME') ?: 'root',
                'password' => getenv('MYSQL_PASSWORD') ?: '',
                'port' => getenv('MYSQL_PORT') ?: 3306,
            ],
            'app' => [
                'name' => getenv('APP_NAME') ?: 'Secret Ville',
                'url' => getenv('APP_URL') ?: 'http://localhost/anonymous-website',
            ],
            'mail' => [
                'from' => getenv('MAIL_FROM') ?: 'noreply@secretville.com',
                'smtp_host' => getenv('MAIL_SMTP_HOST') ?: 'smtp.gmail.com',
                'smtp_username' => getenv('MAIL_SMTP_USERNAME') ?: 'anjolaakinsoyinu@gmail.com',
                'smtp_password' => getenv('MAIL_SMTP_PASSWORD') ?: 'lmsyoeseknskcmdi',
                'smtp_secure' => getenv('MAIL_SMTP_SECURE') ?: PHPMailer::ENCRYPTION_SMTPS,
                'smtp_port' => getenv('MAIL_SMTP_PORT') ?: 465,
            ],
            'pusher' => [
                'app_id' => getenv('PUSHER_APP_ID') ?: '1678820',
                'key' => getenv('PUSHER_APP_KEY') ?: '7e136cd2a9797c421ac1',
                'secret' => getenv('PUSHER_APP_SECRET') ?: '8998ff663690c6c06322',
                'cluster' => getenv('PUSHER_APP_CLUSTER') ?: 'eu',
            ],
            'jwt' => [
                'secret' => getenv('JWT_SECRET') ?: 'mannitol-salt-agar',
            ],
        ];

        return $config[$key] ?? null;
    }
}