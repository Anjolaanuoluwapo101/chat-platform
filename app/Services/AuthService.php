<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Config\Config;
use App\Models\User;

/**
 * AuthService handles JWT token generation, validation, and user authentication.
 */
class AuthService
{
    private $secretKey;
    private $algorithm = 'HS256';
    private $tokenExpiration = 3600; // 1 hour

    public function __construct()
    {
        $this->secretKey = Config::get('jwt')['secret'] ?? 'your-secret-key-change-this-in-production';
    }

    /**
     * Generate JWT token for user.
     */
    public function generateToken(array $userData): string
    {
        $issuedAt = time();
        $expirationTime = $issuedAt + $this->tokenExpiration;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'user' => [
                'id' => $userData['id'],
                'username' => $userData['username'],
                'email' => $userData['email']
            ]
        ];

        return JWT::encode($payload, $this->secretKey, $this->algorithm);
    }

    /**
     * Validate JWT token and return user data.
     */
    public function validateToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, $this->algorithm));
            // Check if token is expired
            if ($decoded->exp < time()) {
                return null;
            }

            return (array) $decoded->user;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Extract token from Authorization header.
     */
    public function getTokenFromHeader(): ?string
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if(empty($authHeader)) return null;

        $authHeader = trim(str_replace('Bearer ', '', $authHeader));
        return $authHeader;
    }

    /**
     * Authenticate user from session.
     */
    public function authenticateFromSession(): ?array
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $token = $_SESSION['jwt_token'] ?? null;
        if (!$token) {
            return null;
        }

        $userData = $this->validateToken($token);
        if (!$userData) {
            // Clear invalid session
            unset($_SESSION['jwt_token']);
            return null;
        }

        // Verify user still exists and is verified
        $userModel = new User();
        $user = $userModel->getById($userData['id']);

        if (!$user || !$user['is_verified']) {
            // Clear invalid session
            unset($_SESSION['jwt_token']);
            return null;
        }

        return $user;
    }

    /**
     * Authenticate user from token (Legacy - for backward compatibility).
     */
    public function authenticateFromToken(): ?array
    {
        // First try session-based auth
        
    }

    /**
     * Invalidate current session.
     */
    public function logout(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Unset specific session variables
        unset($_SESSION['jwt_token']);
        unset($_SESSION['user']);
    }
}