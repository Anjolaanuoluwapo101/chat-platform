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
        @self::loadEnv();
        
        $config = [
            // default database driver: 'sqlite', 'mysql' or 'redis'
            'database_driver' => getenv('DATABASE_DRIVER') ?: 'redis',
            // redis / upstash config
            'redis' => [
                'url' => getenv('REDIS_URL') ?: $_ENV['REDIS_URL'],
                'password' => getenv('REDIS_PASSWORD') ?: $_ENV['REDIS_PASSWORD'],
            ],
            // for sqlite
            'database' => [
                'path' => __DIR__ . '/../../database/secretville.db',
            ],
            // for mysql
            'mysql' => [
                'host' => getenv('MYSQL_HOST') ?: $_ENV['MYSQL_HOST'],
                'dbname' => getenv('MYSQL_DBNAME') ?: $_ENV['MYSQL_DBNAME'],
                'username' => getenv('MYSQL_USERNAME') ?: $_ENV['MYSQL_USERNAME'],
                'password' => getenv('MYSQL_PASSWORD') ?: $_ENV['MYSQL_PASSWORD'],
                'port' => getenv('MYSQL_PORT') ?: $_ENV['MYSQL_PORT'],
            ],
            'app' => [
                'name' => getenv('APP_NAME') ?: $_ENV['APP_NAME'],
                'url' => getenv('APP_URL') ?: $_ENV['APP_URL'],
            ],
            'mail' => [
                'from' => getenv('MAIL_FROM') ?: $_ENV['MAIL_FROM'],
                'smtp_host' => getenv('MAIL_SMTP_HOST') ?: $_ENV['MAIL_SMTP_HOST'],
                'smtp_username' => getenv('MAIL_SMTP_USERNAME') ?: $_ENV['MAIL_SMTP_USERNAME'],
                'smtp_password' => getenv('MAIL_SMTP_PASSWORD') ?: $_ENV['MAIL_SMTP_PASSWORD'],
                'smtp_secure' => getenv('MAIL_SMTP_SECURE') ?: $_ENV['MAIL_SMTP_SECURE'],
                'smtp_port' => getenv('MAIL_SMTP_PORT') ?: $_ENV['MAIL_SMTP_PORT'],
            ],
            'pusher' => [
                'app_id' => getenv('PUSHER_APP_ID') ?: $_ENV['PUSHER_APP_ID'],
                'key' => getenv('PUSHER_APP_KEY') ?: $_ENV['PUSHER_APP_KEY'],
                'secret' => getenv('PUSHER_APP_SECRET') ?: $_ENV['PUSHER_APP_SECRET'],
                'cluster' => getenv('PUSHER_APP_CLUSTER') ?: $_ENV['PUSHER_APP_CLUSTER'],
            ],
            'jwt' => [
                'secret' => getenv('JWT_SECRET') ?: $_ENV['JWT_SECRET'],
            ],
        ];

        return $config[$key] ?? null;
    }
}