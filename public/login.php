<?php
use App\Controllers\UserController;

require_once '../vendor/autoload.php';

$controller = new UserController();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller->login();
} else {
    $controller->showLogin();
}
