<?php

namespace App\Factory;

use App\Database\DatabaseInterface;
use App\Database\RedisDatabase;
use App\Database\SQLiteDatabase;
use App\Config\Config;

class DatabaseFactory
{
    public static function create(string $type): DatabaseInterface
    {
        switch ($type) {
            case 'redis':
                return new RedisDatabase();
            case 'sqlite':
                return new SQLiteDatabase();
            default:
                throw new \InvalidArgumentException("Unsupported database type: $type");
        }
    }

    /**
     * Create the database instance based on configured default driver.
     */
    public static function createDefault(): DatabaseInterface
    {
        $driver = Config::get('database_driver') ?? 'sqlite';
        return self::create($driver);
    }
}
