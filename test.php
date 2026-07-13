<?php

// a script that initializes the database and creates tables, then exits
require_once __DIR__ . '/vendor/autoload.php';
use App\Factory\DatabaseFactory;
try {
    // load environment variables from .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    $db = DatabaseFactory::createDefault();

    // $db->
    echo "Database initialized successfully.\n";
} catch (\Exception $e) {
    echo "Error initializing database: " . $e->getMessage() . "\n";
}