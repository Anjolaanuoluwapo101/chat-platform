<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

use App\Controllers\UserController;

require_once '../vendor/autoload.php';

$controller = new UserController();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller->confirmReset();
} else {
    $controller->showConfirmReset();
}
