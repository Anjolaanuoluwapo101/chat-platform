<?php

// =============================================================================
// Frontend/Backend Router
// =============================================================================

// Configure secure session settings
$isHttps = false;

if (session_status() == PHP_SESSION_NONE) {
    // Determine if running on HTTPS
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ($_SERVER['SERVER_PORT'] ?? 80) == 443
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    // this protects the session cookie from being accessed by JavaScript 
    session_set_cookie_params([
        'lifetime' => 3600, // 1 hour
        'path' => '/', 
        'domain' => 'https://talkyourtalk.onrender.com', // Set to your domain in production
        'secure' => $isHttps, // HTTPS only in production
        'httponly' => true, // No JavaScript access
        'samesite' => 'Lax' // CSRF protection (use 'Strict' for same-domain only)
    ]);

    session_start();
}

// Get the path from the request URI, without query parameters supporting 
$requestUriPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Check if the path starts with /api
if (strpos($requestUriPath, '/api') !== 0) {
    // NOT an API request.
    // This is a route for the React app (e.g., "/", "/dashboard", "/profile").
    // Serve the main index.html file and let React Router take over.
    // @readfile to suppress errors if the file isn't found, though it should be.
    @readfile('index.html');
    // Stop the PHP script from running any further.
    exit;
}


// =============================================================================
// CORS Headers
// =============================================================================

// if (strpos($_SERVER['SERVER_HOST'], 'localhost') !== false) {
//     header('Access-Control-Allow-Origin: http://localhost:5173');
// } else {
// header('Access-Control-Allow-Origin: https://talkyourtalk.onrender.com');
// }
// if($isHttps){
//     header('Access-Control-Allow-Origin: https://talkyourtalk.onrender.com');
// } else {
//     header('Access-Control-Allow-Origin: http://localhost:5173');
// }
// header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Origin: https://talkyourtalk.onrender.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}


// =============================================================================
// Dependencies
// =============================================================================

require_once __DIR__ . '/../vendor/autoload.php';

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


// =============================================================================
// Request Setup
// =============================================================================

// Create Request from globals
$request = Request::createFromGlobals();


// =============================================================================
// Route Collection
// =============================================================================

// Create RouteCollection
$routes = new RouteCollection();


// =============================================================================
// Authentication Routes
// =============================================================================

$routes->add('login', new Route('/api/login', [
    '_controller' => function (Request $request) {
        $controller = new UserController();
        return $controller->login();
    }
], [], [], '', [], ['POST']));

$routes->add('register', new Route('/api/register', [
    '_controller' => function (Request $request) {
        $controller = new UserController();
        return $controller->register();
    }
], [], [], '', [], ['POST']));

$routes->add('verify', new Route('/api/verify', [
    '_controller' => function (Request $request) {
        $controller = new VerificationController();
        return $controller->verify();
    }
], [], [], '', [], ['GET']));

$routes->add('logout', new Route('/api/logout', [
    '_controller' => function (Request $request) {
        $controller = new UserController();
        return $controller->logout();
    }
], [], [], '', [], ['POST']));

// Add new authentication validation routes
$routes->add('validate_auth', new Route('/api/auth/validate', [
    '_controller' => function (Request $request) {
        $controller = new UserController();
        return $controller->validateAuth();
    }
], [], [], '', [], ['POST', 'GET']));

$routes->add('get_current_user', new Route('/api/auth/user', [
    '_controller' => function (Request $request) {
        $controller = new UserController();
        return $controller->getCurrentUser();
    }
], [], [], '', [], ['GET']));

// =============================================================================
// Message Routes
// =============================================================================

$routes->add('view_messages', new Route('/api/messages', [
    '_controller' => function (Request $request) {
        $controller = new MessageController();
        return $controller->viewMessages();
    }
], [], [], '', [], ['GET']));

$routes->add('send_individual_message', new Route('/api/messages', [
    '_controller' => function (Request $request) {
        $controller = new MessageController();
        return $controller->submitMessage();
    }
], [], [], '', [], ['POST']));


// =============================================================================
// Group Routes
// =============================================================================

$routes->add('get_user_groups', new Route('/api/groups', [
    '_controller' => function (Request $request) {
        $controller = new GroupController();
        return $controller->getUserGroups();
    }
], [], [], '', [], ['GET']));

$routes->add('create_group', new Route('/api/groups', [
    '_controller' => function (Request $request) {
        $controller = new GroupController();
        return $controller->createGroup();
    }
], [], [], '', [], ['POST']));

$routes->add('get_group_messages', new Route('/api/groups/{id}', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_GET['group_id'] = $id;
        return $controller->viewMessages();
    }
], ['id' => '\d+'], [], '', [], ['GET']));

$routes->add('get_group_info', new Route('/api/groups/{id}/info', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_GET['group_id'] = $id;
        return $controller->getGroupInfo();
    }
], ['id' => '\d+'], [], '', [], ['GET']));

$routes->add('get_group_members', new Route('/api/groups/{id}/members', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_GET['group_id'] = $id;
        return $controller->getGroupMembers();
    }
], ['id' => '\d+'], [], '', [], ['GET']));

$routes->add('join_group', new Route('/api/groups/{id}/join', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->joinGroup();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('leave_group', new Route('/api/groups/{id}/leave', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->leaveGroup();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('submit_group_message', new Route('/api/groups/{id}/messages', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->submitMessage();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('mark_read', new Route('/api/groups/{id}/markread', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->markRead();
    }
], [], [], '', [], ['POST']));


// =============================================================================
// Group Admin Routes
// =============================================================================

$routes->add('remove_admin', new Route('/api/groups/{id}/remove-admin', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->removeAdmin();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('is_admin', new Route('/api/groups/{id}/is-admin', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_GET['group_id'] = $id;
        return $controller->isAdmin();
    }
], ['id' => '\d+'], [], '', [], ['GET']));

$routes->add('get_group_admins', new Route('/api/groups/{id}/admins', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_GET['group_id'] = $id;
        return $controller->getGroupAdmins();
    }
], ['id' => '\d+'], [], '', [], ['GET']));

$routes->add('update_group_settings', new Route('/api/groups/{id}/update-settings', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->updateGroupSettings();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('delete_group', new Route('/api/groups/{id}/delete', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->deleteGroup();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('ban_user', new Route('/api/groups/{id}/ban-user', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->banUser();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('unban_user', new Route('/api/groups/{id}/unban-user', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->unbanUser();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('promote_admin', new Route('/api/groups/{id}/promote-admin', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->promoteToAdmin();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('demote_admin', new Route('/api/groups/{id}/demote-admin', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->demoteAdmin();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('get_banned_users', new Route('/api/groups/{id}/banned-users', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_GET['group_id'] = $id;
        return $controller->getBannedUsers();
    }
], ['id' => '\d+'], [], '', [], ['GET']));

$routes->add('add_member', new Route('/api/groups/{id}/members', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->addMember();
    }
], ['id' => '\d+'], [], '', [], ['POST']));

$routes->add('remove_member', new Route('/api/groups/{id}/members/remove', [
    '_controller' => function (Request $request, $id) {
        $controller = new GroupController();
        $_POST['group_id'] = $id;
        return $controller->removeMember();
    }
], ['id' => '\d+'], [], '', [], ['POST']));


// =============================================================================
// Pusher Routes
// =============================================================================

$routes->add('pusher_auth', new Route('/api/pusher/auth', [
    '_controller' => function (Request $request) {
        require __DIR__ . '/authenticate-pusher.php';
    }
], [], [], '', [], ['POST']));

//add route for beam authentication
$routes->add('pusher_beam_auth', new Route('/api/pusher/beam-auth', [
    '_controller' => function (Request $request) {
        require __DIR__ . '/authenticate-pusher-beam.php';
    }
], [], [], '', [], ['GET']));


// =============================================================================
// Route Matching and Execution
// =============================================================================

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
    $response = $controller($request, ...array_filter($parameters, function ($key) {
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
    // 404 Not Found
    $response = new Response(
        json_encode(['error' => 'Not Found']),
        Response::HTTP_NOT_FOUND,
        ['Content-Type' => 'application/json']
    );
    $response->send();
} catch (\Exception $e) {
    // 500 Internal Server Error
    // $response = new Response(
    //     json_encode(['error' => 'Internal Server Error']),
    //     Response::HTTP_INTERNAL_SERVER_ERROR,
    //     ['Content-Type' => 'application/json']
    // );
    // $response->send();
    $response = new Response(
        json_encode([
            'error' => 'Internal Server Error',
            'message' => $e->getMessage(), // The actual error message
            'file' => $e->getFile(),       // The file that broke
            'line' => $e->getLine()        // The line number
        ]),
        Response::HTTP_INTERNAL_SERVER_ERROR,
        ['Content-Type' => 'application/json']
    );
    $response->send();
}