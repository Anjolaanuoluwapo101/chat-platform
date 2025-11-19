<?php

use App\Controllers\MessageController;

require_once '../vendor/autoload.php';

$messageController = new MessageController();
$messageController->authenticatePusherBeams();
