<?php

namespace App\Models;

class File
{
    public $id;
    public $file_path;
    public $mime_type;
    public $created_at;

    public function __construct($id = null, $file_path = null, $mime_type = null, $created_at = null)
    {
        $this->id = $id;
        $this->file_path = $file_path;
        $this->mime_type = $mime_type;
        $this->created_at = $created_at;
    }
}
