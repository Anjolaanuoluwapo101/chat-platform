<?php
use App\Controllers\MessageController;
use App\Controllers\GroupController;

require_once '../vendor/autoload.php';

// Check if this is a group message request
// $groupId = isset($_GET['group_id']) ? intval($_GET['group_id']) : null;
$groupId = isset($_POST['group_id']) ? intval($_POST['group_id']) : null;


if ($groupId) {
    // Handle group messages
    $controller = new GroupController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->submitMessage();
    } else {
        $controller->viewMessages();
    }
} else {
    // Handle direct messages (existing functionality)
    $controller = new MessageController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->submitMessage();
    } else {
        $controller->viewMessages();
    }
}
