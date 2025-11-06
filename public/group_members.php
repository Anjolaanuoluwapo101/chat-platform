<?php

use App\Controllers\GroupController;

require_once '../vendor/autoload.php';

$controller = new GroupController();
$controller->getGroupMembers();