<?php

namespace App\Controllers;

use App\Models\User;

class VerificationController extends BaseController
{
    public function verify()
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
