<?php

namespace App\Factory;

use App\Services\LocalStorageAdapter;
use App\Services\R2StorageAdapter;

class StorageFactory
{
    public static function create(string $type)
    {
        switch ($type) {
            case 'local':
                return new LocalStorageAdapter();
            case 'r2':
                return new R2StorageAdapter();
            default:
                throw new \InvalidArgumentException("Unsupported storage type: $type");
        }
    }
}
