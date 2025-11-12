<?php

use Symfony\Component\Routing\Matcher\UrlMatcher;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Controllers\MessageController;
use App\Controllers\GroupController;
use App\Controllers\UserController;
use App\Controllers\VerificationController;

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    http_response_code(200);
    exit;
}

// If the request is for an API endpoint, handle it with the existing router
$request_uri = $_SERVER['REQUEST_URI'];

// Check if this is an API request
$is_api_request = (
    strpos($request_uri, '/api/') === 0 || 
    strpos($request_uri, '/login') === 0 || 
    strpos($request_uri, '/register') === 0 || 
    strpos($request_uri, '/verify') === 0 ||
    strpos($request_uri, '/messages') === 0 ||
    strpos($request_uri, '/groups') === 0 ||
    strpos($request_uri, '/pusher/auth') === 0
);

if ($is_api_request) {
    // Modify the request URI to remove /api prefix if present
    if (strpos($request_uri, '/api/') === 0) {
        $_SERVER['REQUEST_URI'] = substr($request_uri, 4);
    }
    
    // Include the existing routing logic
    require_once __DIR__ . '/../vendor/autoload.php';
    
    // Create Request from globals
    $request = Request::createFromGlobals();
    
    // Create RouteCollection
    $routes = new RouteCollection();
    
    // Authentication routes
    $routes->add('login', new Route('/login', [
        '_controller' => function(Request $request) {
            $controller = new UserController();
            return $controller->login();
        }
    ], [], [], '', [], ['POST']));
    
    $routes->add('register', new Route('/register', [
        '_controller' => function(Request $request) {
            $controller = new UserController();
            return $controller->register();
        }
    ], [], [], '', [], ['POST']));
    
    $routes->add('verify', new Route('/verify', [
        '_controller' => function(Request $request) {
            $controller = new VerificationController();
            return $controller->verify();
        }
    ], [], [], '', [], ['GET']));
    
    // Message routes
    $routes->add('view_messages', new Route('/messages', [
        '_controller' => function(Request $request) {
            $controller = new MessageController();
            return $controller->viewMessages();
        }
    ], [], [], '', [], ['GET']));
    
    $routes->add('send_individual_message', new Route('/messages', [
        '_controller' => function(Request $request) {
            $controller = new MessageController();
            return $controller->submitMessage();
        }
    ], [], [], '', [], ['POST']));
    
    // Group routes
    $routes->add('get_user_groups', new Route('/groups', [
        '_controller' => function(Request $request) {
            $controller = new GroupController();
            return $controller->getUserGroups();
        }
    ], [], [], '', [], ['GET']));
    
    $routes->add('create_group', new Route('/groups', [
        '_controller' => function(Request $request) {
            $controller = new GroupController();
            return $controller->createGroup();
        }
    ], [], [], '', [], ['POST']));
    
    $routes->add('get_group_messages', new Route('/groups/{id}', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_GET['group_id'] = $id;
            return $controller->viewMessages();
        }
    ], ['id' => '\d+'], [], '', [], ['GET']));
    
    $routes->add('get_group_info', new Route('/groups/{id}/info', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_GET['group_id'] = $id;
            return $controller->getGroupInfo();
        }
    ], ['id' => '\d+'], [], '', [], ['GET']));
    
    $routes->add('get_group_members', new Route('/groups/{id}/members', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_GET['group_id'] = $id;
            return $controller->getGroupMembers();
        }
    ],  ['id' => '\d+'], [], '', [], ['GET']));
    
    $routes->add('join_group', new Route('/groups/{id}/join', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->joinGroup();
        }
    ], ['id' => '\d+'], [], '', [], ['POST']));
    
    $routes->add('submit_group_message', new Route('/groups/{id}/messages', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->submitMessage();
        }
    ], ['id' => '\d+'], [], '', [], ['POST']));
    
    $routes->add('mark_read', new Route('/groups/{id}/markread', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->markRead();
        }
    ], [], [], '', [], ['POST']));
    
    // Admin routes
    $routes->add('remove_admin', new Route('/groups/{id}/remove-admin', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->removeAdmin();
        }
    ], ['id' => '\d+'], [], '', [], ['POST']));
    
    $routes->add('is_admin', new Route('/groups/{id}/is-admin', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_GET['group_id'] = $id;
            return $controller->isAdmin();
        }
    ], ['id' => '\d+'], [], '', [], ['GET']));
    
    $routes->add('get_group_admins', new Route('/groups/{id}/admins', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_GET['group_id'] = $id;
            return $controller->getGroupAdmins();
        }
    ], ['id' => '\d+'], [], '', [], ['GET']));
    
    $routes->add('update_group_settings', new Route('/groups/{id}/update-settings', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->updateGroupSettings();
        }
    ], ['id' => '\d+'], [], '', [], ['POST']));
    
    $routes->add('delete_group', new Route('/groups/{id}/delete', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->deleteGroup();
        }
    ], ['id' => '\d+'], [], '', [], ['POST']));
    
    $routes->add('ban_user', new Route('/groups/{id}/ban-user', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->banUser();
        }
    ], ['id' => '\d+'], [], '', [], ['POST']));
    
    $routes->add('unban_user', new Route('/groups/{id}/unban-user', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->unbanUser();
        }
    ], ['id' => '\d+'], [], '', [], ['POST']));
    
    $routes->add('promote_admin', new Route('/groups/{id}/promote-admin', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->promoteToAdmin();
        }
    ], ['id' => '\d+'], [], '', [], ['POST']));
    
    $routes->add('demote_admin', new Route('/groups/{id}/demote-admin', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_POST['group_id'] = $id;
            return $controller->demoteAdmin();
        }
    ], ['id' => '\d+'], [], '', [], ['POST']));
    
    $routes->add('get_banned_users', new Route('/groups/{id}/banned-users', [
        '_controller' => function(Request $request, $id) {
            $controller = new GroupController();
            $_GET['group_id'] = $id;
            return $controller->getBannedUsers();
        }
    ], ['id' => '\d+'], [], '', [], ['GET']));
    
    $routes->add('pusher_auth', new Route('/pusher/auth', [
        '_controller' => function(Request $request) {
            require __DIR__ . '/authenticate-pusher.php';
        }
    ], [], [], '', [], ['POST']));
    
    // Create RequestContext
    $context = new RequestContext();
    $context->fromRequest($request);
    
    // Create UrlMatcher
    $matcher = new UrlMatcher($routes, $context);
    
    try {
        // Match the route
        $parameters = $matcher->match($request->getPathInfo());
        
        // Set route parameters to the request
        $request->attributes->add($parameters);
        
        // Get the controller
        $controller = $parameters['_controller'];
        
        // Execute the controller
        $response = $controller($request, ...array_filter($parameters, function($key) {
            return $key !== '_controller' && $key !== '_route';
        }, ARRAY_FILTER_USE_KEY));
        
        // If the response is already a Response object, use it, otherwise create one
        if (!$response instanceof Response) {
            $response = new Response(
                $response,
                Response::HTTP_OK,
                ['Content-Type' => 'application/json']
            );
        }
        
        // Send the response
        $response->send();
        
    } catch (\Symfony\Component\Routing\Exception\ResourceNotFoundException $e) {
        // 404 Not Found - Serve static files or index.html for SPA
        serveStaticFile();
    } catch (\Exception $e) {
        // 500 Internal Server Error
        $response = new Response(
            json_encode(['error' => 'Internal Server Error: ' . $e->getMessage()]),
            Response::HTTP_INTERNAL_SERVER_ERROR,
            ['Content-Type' => 'application/json']
        );
        $response->send();
    }
} else {
    // Serve static frontend files
    serveStaticFile();
}

function serveStaticFile() {
    $request_uri = $_SERVER['REQUEST_URI'];
    
    // Remove query string
    $request_uri = parse_url($request_uri, PHP_URL_PATH);
    
    // Security check - prevent directory traversal
    if (strpos($request_uri, '..') !== false) {
        http_response_code(404);
        echo '404 Not Found';
        return;
    }
    
    // Default to index.html for SPA routing
    if ($request_uri === '/' || $request_uri === '') {
        $file_path = __DIR__ . '/index.html';
    } else {
        $file_path = __DIR__ . $request_uri;
    }
    
    // If file doesn't exist, serve index.html for SPA
    if (!file_exists($file_path)) {
        $file_path = __DIR__ . '/index.html';
    }
    
    // If index.html doesn't exist, that's a problem
    if (!file_exists($file_path)) {
        http_response_code(404);
        echo '404 Not Found';
        return;
    }
    
    // Determine content type
    $extension = pathinfo($file_path, PATHINFO_EXTENSION);
    $content_types = [
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject'
    ];
    
    $content_type = $content_types[$extension] ?? 'text/html';
    
    // Serve the file
    header('Content-Type: ' . $content_type);
    readfile($file_path);
}