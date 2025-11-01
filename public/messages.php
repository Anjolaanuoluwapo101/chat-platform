<?php
use App\Controllers\MessageController;

require_once '../vendor/autoload.php';

$controller = new MessageController();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller->submitMessage();
} else {
    $controller->viewMessages();
}
