<?php

header('Access-Control-Allow-Origin: http://localhost:3000'); // React dev server
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
        return $controller->getInfo();
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
    // 404 Not Found
    $response = new Response(
        json_encode(['error' => 'Not Found']),
        Response::HTTP_NOT_FOUND,
        ['Content-Type' => 'application/json']
    );
    $response->send();
} catch (\Exception $e) {
    // 500 Internal Server Error
    $response = new Response(
        json_encode(['error' => 'Internal Server Error']),
        Response::HTTP_INTERNAL_SERVER_ERROR,
        ['Content-Type' => 'application/json']
    );
    $response->send();
}