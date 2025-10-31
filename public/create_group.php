<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: /login.php');
    exit;
}

use App\Controllers\GroupController;

require_once '../vendor/autoload.php';

$controller = new GroupController();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller->createGroup();
} else {
    $controller->showCreateGroupForm();
}
