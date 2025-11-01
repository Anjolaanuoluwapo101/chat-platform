<?php

namespace App\Controllers;

use App\Models\User;

class VerificationController extends BaseController
{
    public function verify()
    {
        // Check if API call or legacy view
        if ($this->isAjax() || (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false)) {
            $this->verifyApi();
        } else {
            $this->verifyLegacy();
        }
    }

    /**
     * API endpoint for email verification.
     */
    private function verifyApi()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $user = new User();
        $username = $input['username'] ?? '';
        $code = $input['code'] ?? '';

        if (!$username || !$code) {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Username and code are required']], 400);
        }

        $userData = $user->getByUsername($username);
        if ($userData && $userData['verification_code'] == $code) {
            // Update user as verified
            $user->updateVerified($username);
            $this->jsonResponse(['success' => true, 'message' => 'Email verified successfully.']);
        } else {
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Invalid verification code.']], 400);
        }
    }

    /**
     * Legacy verification via GET parameters.
     */
    private function verifyLegacy()
    {
        $user = new User();
        $username = $_GET['username'] ?? '';
        $code = $_GET['code'] ?? '';

        if (!$username || !$code) {
            http_response_code(404);
            die();
        }

        $userData = $user->getByUsername($username);
        if ($userData && $userData['verification_code'] == $code) {
            // Update user as verified
            $user->updateVerified($username);
            $this->render('login', ['message' => 'Email verified successfully. You can now log in.']);
        } else {
            $this->render('register', ['errors' => ['general' => 'Invalid verification link.']]);
        }
    }
}
