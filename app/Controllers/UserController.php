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
        try {
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
            // the username must be alphanumeric only no whitespaces or special characters
            if (!ctype_alnum($username)) {
                $errors['username'] = 'Username must be alphanumeric only.';
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
            $registrationSuccess = $user->register($username, $password, $email);

            if ($registrationSuccess) {
                $this->logger->info("User registered: $username ($email)");
                $userData = $user->getByUsername($username);
                $authService = new AuthService();
                $token = $authService->generateToken($userData);

                // Start session and store JWT token
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }

                // Store JWT in session (not returned to client)
                $_SESSION['jwt_token'] = $token;
                $_SESSION['user'] = [
                    'id' => $userData['id'],
                    'username' => $userData['username'],
                    'email' => $userData['email']
                ];

                $this->jsonResponse([
                    'success' => true,
                    'message' => 'Registration successful.',
                    'user' => [
                        'id' => $userData['id'],
                        'username' => $userData['username'],
                        'email' => $userData['email']
                    ]
                ]);
            } else {
                // Check if the user already exists
                if ($user->getByUsername($username)) {
                    throw new \Exception("Registration failed for: $username - user already exists");
                } else {
                    throw new \Exception("Registration failed for: $username ($email) - database save operation failed");
                }
            }
        } catch (\Exception $e) {
            $this->logger->error("Registration error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'An error occurred during registration.', 'details' => $e->getMessage()]], 500);
        }
    }

    /**
     * API endpoint for user login.
     */
    public function login()
    {
        try {
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
            if ($userData && $user->verifyPassword($password, $userData['password_hash'])) { //check for correct password
                if ($userData['is_verified']) {//check if user is verified
                    $this->logger->info("User logged in via API: $username"); //log successful login

                    // Start session and store JWT token
                    if (session_status() === PHP_SESSION_NONE) {
                        session_start();
                    }

                    $authService = new AuthService();
                    $token = $authService->generateToken($userData);

                    // Store JWT in session (not returned to client)
                    $_SESSION['jwt_token'] = $token;
                    // not returned to client and also not used for authentication
                    $_SESSION['user'] = [
                        'id' => $userData['id'],
                        'username' => $userData['username'],
                        'email' => $userData['email']
                    ];
                    
                    $this->jsonResponse([
                        'success' => true,
                        'user' => [
                            'id' => $userData['id'],
                            'username' => $userData['username'],
                            'email' => $userData['email'],
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
        } catch (\Exception $e) {
            $this->logger->error("Login error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'An error occurred during login.', 'details' => $e->getMessage()]], 500);
        }
    }

    /**
     * API endpoint to check auth
     */
    public function validateAuth()
    {
        $user = $this->checkAuth();
        if($user) {
            $this->jsonResponse(['success' => true]);
        } else {
            $this->jsonResponse(['success' => false], 401);
        }
    }

    /**
     * API endpoint to get current user data server-side or validate current authentication
     */
    public function getCurrentUser()
    {
        try {
            // For getting user data, we also check session authentication
            $user = $this->checkAuth();
            
            if ($user) {
                $this->jsonResponse([
                    'success' => true,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email']
                    ]
                ]);
            } else {
                $this->jsonResponse(['success' => false, 'user' => null], 401);
            }
        } catch (\Exception $e) {
            $this->logger->error("Get user error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'user' => null], 401);
        }
    }

    /**
     * API endpoint for password reset request.
     */
    public function reset()
    {
        try {
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
        } catch (\Exception $e) {
            $this->logger->error("Password reset error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'An error occurred during password reset.', 'details' => $e->getMessage()]], 500);
        }
    }

    /**
     * API endpoint for confirming password reset.
     */
    public function confirmReset()
    {
        try {
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
        } catch (\Exception $e) {
            $this->logger->error("Confirm password reset error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'An error occurred during password reset confirmation.', 'details' => $e->getMessage()]], 500);
        }
    }

    /**
     * API endpoint for logout.
     */
    public function logout()
    {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Clear session data
            $_SESSION = [];

            // Destroy session cookie
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(
                    session_name(),
                    '',
                    time() - 42000,
                    $params["path"],
                    $params["domain"],
                    $params["secure"],
                    $params["httponly"]
                );
            }

            // Destroy session
            session_destroy();

            $this->jsonResponse(['success' => true, 'message' => 'Logged out successfully.']);
        } catch (\Exception $e) {
            $this->logger->error("Logout error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'An error occurred during logout.']], 500);
        }
    }
}