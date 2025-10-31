<?php

namespace App\Controllers;

class BaseController
{
    public function __construct()
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

    }
    protected function render($view, $data = [])
    {
        extract($data);
        include __DIR__ . "/../../views/$view.php";
    }

    protected function redirect($url)
    {
        header("Location: $url");
        exit;
    }

    protected function isAjax()
    {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }
}
