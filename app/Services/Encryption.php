<?php

namespace App\Services;

class Encryption
{
    private $cipher = "AES-128-CTR";
    private $key = "secretville"; // In production, use env var
    private $iv = '3002200330022003';

    public function encrypt($data)
    {
        return openssl_encrypt($data, $this->cipher, $this->key, 0, $this->iv);
    }

    public function decrypt($data)
    {
        return openssl_decrypt($data, $this->cipher, $this->key, 0, $this->iv);
    }
}
