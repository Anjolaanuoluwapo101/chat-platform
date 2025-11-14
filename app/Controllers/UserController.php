<?php

namespace App\Controllers;

use App\Models\User;
use App\Services\Encryption;
use App\Services\Mailer;
use App\Config\Config;
use App\Services\AuthService;
use App\Log\Logger;

/**
 * UserController handles user registration, login, and password reset.
 * Only accessible via API with JSON responses.
 */
class UserController extends BaseController
{
    private $logger;

    public function __construct()
    {
        parent::__construct();
        $this->logger = new Logger();
    }

    /**
     * API endpoint for user registration.
     */
    public function register()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $user = new User();
        $mailer = new Mailer();
        $errors = [];

        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        $email = $input['email'] ?? '';

        // Validation
        if (empty($username) || strlen($username) < 5) {
            $errors['username'] = 'Username must be at least 5 characters.';
        }
        if (empty($password) || strlen($password) < 5) {
            $errors['password'] = 'Password must be at least 5 characters.';
        }
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email address.';
        }

        if (!empty($errors)) {
            $this->jsonResponse(['success' => false, 'errors' => $errors], 400);
            return;
        }

        $verificationCode = $user->register($username, $password, $email);

        if ($verificationCode) {
            $this->logger->info("User registered: $username ($email)");
            $url = Config::get('app')['url'] . "/verify.php?username=" . urlencode($username) . "&code=$verificationCode";
            $mailer->sendVerificationEmail($email, $verificationCode, $url);
            // Generate JWT token for immediate login after registration
            $userData = $user->getByUsername($username);
            $authService = new AuthService();
            $token = $authService->generateToken($userData);
            $this->jsonResponse([
                'success' => true,
                'message' => 'Registration successful. Check your email for verification.',
                'token' => $token,
                'user' => [
                    'id' => $userData['id'],
                    'username' => $userData['username'],
                    'email' => $userData['email']
                ]
            ]);
        } else {
            $this->logger->error("Registration failed for: $username ($email)");
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Registration failed.']], 500);
        }
    }

    /**
     * API endpoint for user login.
     */
    public function login()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $user = new User();
        $mailer = new Mailer();

        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        // Validation
        if (empty($username) || strlen($username) < 5) {
            $this->jsonResponse(['success' => false, 'errors' => ['username' => 'Username must be at least 5 characters.']], 400);
            return;
        }
        if (empty($password) || strlen($password) < 5) {
            $this->jsonResponse(['success' => false, 'errors' => ['password' => 'Password must be at least 5 characters.']], 400);
            return;
        }

        $userData = $user->getByUsername($username);
        if ($userData && $user->verifyPassword($password, $userData['password_hash'])) {
            if ($userData['is_verified']) {
                $this->logger->info("User logged in via API: $username");
                // Generate JWT token
                $authService = new AuthService();
                $token = $authService->generateToken($userData);
                $this->jsonResponse([
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'id' => $userData['id'],
                        'username' => $userData['username'],
                        'email' => $userData['email']
                    ]
                ]);
            } else {
                // Resend verification email
                $url = Config::get('app')['url'] . "/verify.php?username=" . urlencode($username) . "&code=" . $userData['verification_code'];
                $mailer->sendVerificationEmail($userData['email'], $userData['verification_code'], $url);
                $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Account not verified. Check your email for verification link.']], 403);
            }
        } else {
            $this->logger->warning("Failed API login attempt for: $username");
            $this->jsonResponse(['success' => false, 'errors' => ['password' => 'Invalid credentials.']], 200);
        }
    }

    /**
     * API endpoint for password reset request.
     */
    public function reset()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $user = new User();
        $encryption = new Encryption();
        $mailer = new Mailer();

        $username = $input['username'] ?? '';
        $userData = $user->getByUsername($username);

        if ($userData) {
            $encrypted = $encryption->encrypt($username);
            $url = Config::get('app')['url'] . "/reset.php?q=$encrypted";
            $mailer->sendResetEmail($userData['email'], $encrypted, $url);
            $this->jsonResponse(['success' => true, 'message' => 'Reset email sent.']);
        } else {
            $this->jsonResponse(['success' => false, 'errors' => ['username' => 'Username not found.']], 404);
        }
    }

    /**
     * API endpoint for confirming password reset.
     */
    public function confirmReset()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $encryption = new Encryption();
        $user = new User();

        $token = $input['token'] ?? '';
        $newPassword = $input['password'] ?? '';

        if (empty($token) || empty($newPassword)) {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Token and password are required.']], 400);
            return;
        }

        $username = $encryption->decrypt($token);
        if ($username && $user->updatePassword($username, $newPassword)) {
            $this->jsonResponse(['success' => true, 'message' => 'Password updated successfully.']);
        } else {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Invalid token or update failed.']], 400);
        }
    }
}
