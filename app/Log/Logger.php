<?php

namespace App\Log;

class Logger
{
    private $logFile;

    public function __construct($logFile = null)
    {
        $this->logFile = $logFile ?: __DIR__ . '/../../logs/app.log';
        $this->ensureLogDirectoryExists();
    }

    private function ensureLogDirectoryExists()
    {
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }

    public function log($message, $level = 'INFO')
    {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] [$level] $message" . PHP_EOL;
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }

    public function info($message)
    {
        $this->log($message, 'INFO');
    }

    public function error($message)
    {
        $this->log($message, 'ERROR');
    }

    public function warning($message)
    {
        $this->log($message, 'WARNING');
    }
}
