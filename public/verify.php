<?php

use App\Controllers\VerificationController;

require_once '../vendor/autoload.php';

$controller = new VerificationController();
$controller->verify();
