<?php

namespace App\Models;

use App\Factory\DatabaseFactory;
use Exception;

class User
{
    private $db;
    private $data;

    public function __construct($data = [])
    {
        $this->db = DatabaseFactory::create('sqlite');
        $this->data = $data;
    }

    public function validateUsername($username)
    {
        return preg_match('/^[a-z]{3,}[0-9]{2,}$/', $username);
    }

    public function validateEmail($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    public function hashPassword($password)
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    public function verifyPassword($password, $hash)
    {
        return password_verify($password, $hash);
    }

    public function register($username, $password, $email)
    {
        try {
            if (!$this->validateUsername($username) || !$this->validateEmail($email)) {
                return false;
            }

            if ($user = $this->db->getUser($username)) {
                return false; // User exists
            }

            $verificationCode = rand(100000, 999999); // Generate 6-digit code

            $user = [
                'username' => $username,
                'password_hash' => $this->hashPassword($password),
                'email' => $email,
                'verification_code' => $verificationCode,
                'is_verified' => 0,
            ];

            $this->db->saveUser($user);
            return $verificationCode; // Return code for email sending
        } catch(Exception $e){
            return $e->getMessage();
        }
    }

    public function login($username, $password)
    {
        $user = $this->db->getUser($username);
        if ($user && $this->verifyPassword($password, $user['password']) && $user['is_verified']) {
            return $user;
        }
        return false;
    }

    public function getByUsername($username)
    {
        return $this->db->getUser($username);
    }

    public function updatePassword($username, $newPassword)
    {
        $this->db->updateUser($username, ['password' => $this->hashPassword($newPassword)]);
    }

    public function updateVerified($username)
    {
        $this->db->updateUser($username, ['is_verified' => 1]);
    }
}
