<?php
require 'vendor/autoload.php';

try {
    $client = new Predis\Client();
    echo 'Redis connection: ' . ($client->ping() ? 'OK' : 'Failed') . PHP_EOL;
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
