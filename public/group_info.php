<?php

use App\Controllers\GroupController;

require_once '../vendor/autoload.php';

$controller = new GroupController();
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $controller->getInfo();
}
