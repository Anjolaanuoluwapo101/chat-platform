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
            $envPath = __DIR__ . '/../../';
            if (file_exists($envPath . '.env')) {
                // Load .env file only if it exists (local development)
                self::$dotenv = Dotenv::createImmutable($envPath);
                self::$dotenv->load();
            } else {
                // In production, Dotenv isn't needed as vars are provided by the environment
                self::$dotenv = true; // Mark as loaded so we don't keep checking
            }
        }
    }
    
    public static function get($key)
    {
        // Load environment variables
        @self::loadEnv();
        
        $config = [
            'name' => getenv('APP_NAME') ?: $_ENV['APP_NAME'],
            // default database driver: 'sqlite', 'mysql' or 'redis'
            'database_driver' => getenv('DATABASE_DRIVER') ?: 'redis',
            // redis / upstash config
            'redis' => [
                // 'url' => getenv('REDIS_URL') ?: $_ENV['REDIS_URL'],
                'url' => $_ENV['REDIS_URL'],
                'password' => getenv('REDIS_PASSWORD') ?: $_ENV['REDIS_PASSWORD'],
                'fallback_driver' => getenv('REDIS_FALLBACK_DRIVER') ?: ($_ENV['REDIS_FALLBACK_DRIVER'] ?? 'postgres'),
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
            // for postgres / supabase
            'postgres' => [
                'url' => getenv('SUPABASE_URL') ?: ($_ENV['SUPABASE_URL'] ?? (getenv('POSTGRES_URL') ?: ($_ENV['POSTGRES_URL'] ?? null))),
                'host' => getenv('PG_HOST') ?: ($_ENV['PG_HOST'] ?? '127.0.0.1'),
                'dbname' => getenv('PG_DBNAME') ?: ($_ENV['PG_DBNAME'] ?? 'postgres'),
                'username' => getenv('PG_USERNAME') ?: ($_ENV['PG_USERNAME'] ?? 'postgres'),
                'password' => getenv('PG_PASSWORD') ?: ($_ENV['PG_PASSWORD'] ?? ''),
                'port' => getenv('PG_PORT') ?: ($_ENV['PG_PORT'] ?? 5432),
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
                'beam_instance_id' => getenv('PUSHER_BEAM_INSTANCE_ID') ?: $_ENV['PUSHER_BEAM_INSTANCE_ID'],
                'beam_secret_key' => getenv('PUSHER_BEAM_SECRET_KEY') ?: $_ENV['PUSHER_BEAM_SECRET_KEY'],
            ],
            'jwt' => [
                'secret' => getenv('JWT_SECRET') ?: $_ENV['JWT_SECRET'],
            ],
            'filelu' => [
                'secret' => getenv('FILELU_SECRET') ?: $_ENV['FILELU_SECRET'],
            ],
            'filestack' => [
                'api_key' => getenv('FILESTACK_API_KEY') ?: $_ENV['FILESTACK_API_KEY'],
            ],
            'r2' => [
                // 'region' => getenv('R2_REGION') ?: $_ENV['R2_REGION'],
                'access_key_id' => getenv('R2_ACCESS_KEY_ID') ?: $_ENV['R2_ACCESS_KEY_ID'],
                'secret_access_key' => getenv('R2_SECRET_ACCESS_KEY') ?: $_ENV['R2_SECRET_ACCESS_KEY'],
                'account_id' => getenv('R2_ACCOUNT_ID') ?: $_ENV['R2_ACCOUNT_ID'],
                'bucket_name' => getenv('R2_BUCKET_NAME') ?: $_ENV['R2_BUCKET_NAME'],
                'public_bucket_url' => getenv('R2_PUBLIC_BUCKET_URL') ?: $_ENV['R2_PUBLIC_BUCKET_URL'],
            ]
        ];

        return $config[$key] ?? null;
    }
}