<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
//check request method
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    throw new Exception('Invalid request method');
}


use App\Controllers\MessageController;

require_once '../vendor/autoload.php';

$controller = new MessageController();
$controller->submitMessage();
