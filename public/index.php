<?php
// Enable CORS for API requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// For API requests, continue to routing
if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
    // API request - continue to normal routing
} else {
    // Web request - redirect to login
    header('Location: /login.php');
    exit();
}

require_once '../vendor/autoload.php';

$uri = $_GET['uri'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Route API requests
if (strpos($uri, 'api/') === 0) {
    $apiPath = substr($uri, 4); // Remove 'api/' prefix

    switch ($apiPath) {
        case 'register':
            require_once 'register.php';
            break;
        case 'login':
            require_once 'login.php';
            break;
        case 'messages':
            require_once 'messages.php';
            break;
        case 'submit_message':
            require_once 'submit_message.php';
            break;
        case 'groups':
            require_once 'groups.php';
            break;
        case 'create_group':
            require_once 'create_group.php';
            break;
        case 'submit_group_message':
            require_once 'submit_group_message.php';
            break;
        case 'delete_group':
            require_once 'delete_group.php';
            break;
        case 'authenticate-pusher':
            require_once 'authenticate-pusher.php';
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'API endpoint not found']);
            break;
    }
} else {
    // Fallback for non-API requests
    header('Location: /login.php');
}

