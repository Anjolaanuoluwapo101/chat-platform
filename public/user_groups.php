<?php
use App\Controllers\GroupController;

require_once __DIR__ . '/../vendor/autoload.php';

$controller = new GroupController();
$controller->getUserGroups();
