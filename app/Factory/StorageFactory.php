<?php

namespace App\Factory;

use App\Services\LocalStorageAdapter;

class StorageFactory
{
    public static function create(string $type)
    {
        switch ($type) {
            case 'local':
                return new LocalStorageAdapter();
            default:
                throw new \InvalidArgumentException("Unsupported storage type: $type");
        }
    }
}
