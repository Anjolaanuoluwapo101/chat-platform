<?php

namespace App\Controllers;

use App\Models\User;
use App\Services\Encryption;
use App\Services\Mailer;
use App\Config\Config;
use App\Log\Logger;

class UserController extends BaseController
{
    private $logger;

    public function __construct()
    {
        parent::__construct();
        $this->logger = new Logger();
    }

    public function register()
    {
        $user = new User();
        $mailer = new Mailer();
        $errors = [];

        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
        $email = $_POST['email'] ?? '';


        //Validation
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
            if ($this->isAjax()) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'errors' => $errors]);
                exit;
            } else {
                $this->render('register', ['errors' => $errors]);
                return;
            }
        }

        $verificationCode = $user->register($username, $password, $email);

        if ($verificationCode) {
            $this->logger->info("User registered: $username ($email)");
            $url = Config::get('app')['url'] . "/verify.php?username=" . urlencode($username) . "&code=$verificationCode";
            $mailer->sendVerificationEmail($email, $verificationCode, $url);
            if ($this->isAjax()) {
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'Registration successful. Check your email for verification.', 'redirect' => 'login.php']);
                exit;
            } else {
                $this->render('register', ['message' => 'Registration successful. Check your email for verification.']);
            }
        } else {
            $this->logger->error("Registration failed for: $username ($email)");
            $errors['general'] = 'Registration failed. Verification Code could not be obtained';
            if ($this->isAjax()) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'errors' => $errors]);
                exit;
            } else {
                $this->render('register', ['errors' => $errors]);
            }
        }
    }



    public function login()
    {
        $user = new User();
        $mailer = new Mailer();
        $errors = [];
        $messages = [];

        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        // Validation
        if (empty($username) || strlen($username) < 5) {
            $errors['username'] = 'Username must be at least 5 characters.';
        }
        if (empty($password) || strlen($password) < 5) {
            $errors['password'] = 'Password must be at least 5 characters.';
        }

        if (!empty($errors)) {
            $_SESSION['errors'] = $errors;
            $_SESSION['messages'] = $messages;
            header('Location: login.php');
            exit;
        }

        $userData = $user->getByUsername($username);
        if ($userData && $user->verifyPassword($password, $userData['password_hash'])) {
            if ($userData['is_verified']) {
                $this->logger->info("User logged in: $username");
                //destroy previous session
                //$this->destroySession();
                //create new session
                $_SESSION['user'] = $userData;
                $_SESSION['user']['username'] = password_hash($username,PASSWORD_DEFAULT);

                if ($this->isAjax()) {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'redirect' => 'messages.php?q=' . urlencode($username)]);
                    exit;
                } else {
                    $this->redirect('messages.php?q=' . urlencode($username));
                }
            } else {
                // Resend verification email
                $url = Config::get('app')['url'] . "/verify.php?username=" . urlencode($username) . "&code=" . $userData['verification_code'];
                $mailer->sendVerificationEmail($userData['email'], $userData['verification_code'], $url);
                $messages['info'] = 'Account not verified. Check your email for verification link.';
                $_SESSION['errors'] = $errors;
                $_SESSION['messages'] = $messages;
                header('Location: login.php');
                exit;
            }
        } else {
            $this->logger->warning("Failed login attempt for: $username");
            $errors['password'] = 'Invalid credentials.';
        }
    }

    private function destroySession()
    {
        if (session_status() != PHP_SESSION_NONE) {
            session_destroy();

            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(
                    session_name(),
                    "",
                    time() - 999999999999,
                    $params["path"],
                    $params["domain"],
                    $params["secure"],
                    $params["httponly"]
                );
            }
        }
    }

    public function reset()
    {
        $user = new User();
        $encryption = new Encryption();
        $mailer = new Mailer();
        $errors = [];

        $username = $_POST['username'] ?? '';
        $userData = $user->getByUsername($username);

        if ($userData) {
            $encrypted = $encryption->encrypt($username);
            $url = \App\Config\Config::get('app')['url'] . "/reset.php?q=$encrypted";
            $mailer->sendResetEmail($userData['email'], $encrypted, $url);
            echo "<script>alert('Email sent');</script>";
        } else {
            $errors['username'] = 'Username not found.';
            $this->render('reset', ['errors' => $errors]);
        }
    }

    public function showRegister()
    {
        $this->render('register', []);
    }

    public function showLogin()
    {
        $this->render('login', []);
    }

    public function showReset()
    {
        $this->render('reset', []);
    }

    public function showConfirmReset()
    {
        $this->render('confirm_reset', []);
    }

    public function confirmReset()
    {
        $encryption = new Encryption();
        $user = new User();

        $username = '';
        if (isset($_GET['q'])) {
            $username = $encryption->decrypt($_GET['q']);
        }

        $newPassword = $_POST['password'] ?? '';
        $user->updatePassword($username, $newPassword);
        $this->redirect('login.php');
    }
}
