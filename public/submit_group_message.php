<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

use App\Controllers\GroupController;

require_once '../vendor/autoload.php';

$controller = new GroupController();
$controller->submitGroupMessage();
