<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

use App\Controllers\VerificationController;

require_once '../vendor/autoload.php';

$controller = new VerificationController();
$controller->verify();
