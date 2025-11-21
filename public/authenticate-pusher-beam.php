<?php

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

use App\Controllers\MessageController;

require_once '../vendor/autoload.php';

$messageController = new MessageController();
$messageController->authenticatePusherBeams();
