<?php

namespace App\Factory;

use App\Database\DatabaseInterface;
use App\Database\RedisDatabase;
use App\Database\SQLiteDatabase;

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
}
