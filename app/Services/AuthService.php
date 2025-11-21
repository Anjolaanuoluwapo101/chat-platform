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
            return null;
        }

        // Verify user still exists and is verified
        $userModel = new User();
        $user = $userModel->getById($userData['id']);

        if (!$user || !$user['is_verified']) {
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
        $user = $this->authenticateFromSession();
        if ($user) {
            return $user;
        }
        
        return null;
    }

    /**
     * Refresh token (generate new one with updated expiration).
     */
    public function refreshToken(string $oldToken): ?string
    {
        $userData = $this->validateToken($oldToken);
        if (!$userData) {
            return null;
        }

        // Get fresh user data
        $userModel = new User();
        $user = $userModel->getById($userData['id']);

        if (!$user) {
            return null;
        }

        return $this->generateToken($user);
    }

    /**
     * Generate CSRF token.
     */
    public function generateCsrfToken(): string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }

    /**
     * Validate CSRF token.
     */
    public function validateCsrfToken(string $token): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Get CSRF token from request header.
     */
    public function getCsrfTokenFromHeader(): ?string
    {
        $headers = getallheaders();
        return $headers['X-CSRF-Token'] ?? $headers['X-Csrf-Token'] ?? null;
    }
}
