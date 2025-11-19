<?php

namespace App\Services;

use App\Config\Config;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use App\Log\Logger;

class Mailer
{
    private $mailer;
    private $logger;

    public function __construct()
    {
        $this->logger = new Logger();
        $this->mailer = new PHPMailer(true);
        $this->setupSMTP();
    }

    private function setupSMTP()
    {
        $mailConfig = Config::get('mail');

        $this->mailer->isSMTP();
        $this->mailer->Host = $mailConfig['smtp_host'];
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $mailConfig['smtp_username'];
        $this->mailer->Password = $mailConfig['smtp_password'];
        $this->mailer->SMTPSecure = $mailConfig['smtp_secure'];
        $this->mailer->Port = $mailConfig['smtp_port'];

        $this->mailer->setFrom($mailConfig['from'], Config::get('app')['name']);
    }

    public function sendResetEmail($to, $encryptedUsername, $url)
    {
        try {
            $this->mailer->addAddress($to);
            // get the app name 
            $this->mailer->Subject = Config::get('app')['name'] . ' Password Reset';
            $this->mailer->Body = "Click the link to reset your password: $url";
            $this->mailer->isHTML(false);

            $this->mailer->send();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function sendVerificationEmail($to, $verificationCode, $url)
    {
        try {
            $this->mailer->addAddress($to);
            $this->mailer->Subject = Config::get('app')['name'] . ' Email Verification';
            $this->mailer->Body = "Your verification code is: $verificationCode\n\nOr click the link to verify: $url";
            $this->mailer->isHTML(false);

            $this->mailer->send();
            return true;
        } catch (Exception $e) {
            $this->logger->error("Failed to send verification email to $to: " . $e->getMessage());
            return $e;
        }
    }
}
