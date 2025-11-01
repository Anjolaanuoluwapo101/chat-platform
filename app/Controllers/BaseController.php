<?php

namespace App\Controllers;

class BaseController
{
    public function __construct()
    {
        // Enable CORS for React frontend
        $this->setCorsHeaders();

        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    }

    /**
     * Set CORS headers to allow requests from React frontend.
     */
    private function setCorsHeaders()
    {
        header('Access-Control-Allow-Origin: http://localhost:3000'); // React dev server
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    /**
     * Render a view (for backward compatibility, but we'll phase this out).
     */
    protected function render($view, $data = [])
    {
        extract($data);
        include __DIR__ . "/../../views/$view.php";
    }

    /**
     * Return JSON response.
     */
    protected function jsonResponse($data, $statusCode = 200)
    {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }

    /**
     * Redirect (for backward compatibility).
     */
    protected function redirect($url)
    {
        header("Location: $url");
        exit;
    }

    /**
     * Check if request is AJAX or API call.
     */
    protected function isAjax()
    {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }

    /**
     * Get Bearer token from Authorization header.
     */
    protected function getBearerToken()
    {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    /**
     * Authenticate user via token (for API calls).
     */
    protected function authenticateUser()
    {
        $token = $this->getBearerToken();
        if (!$token) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }

        // For now, assume token is user ID (in production, validate JWT)
        $userId = $token;
        // TODO: Validate token properly
        return $userId;
    }
}
