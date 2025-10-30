<?php

namespace App\Controllers;

use App\Models\Message;
use App\Factory\StorageFactory;
use App\Models\Photo;
use App\Models\Video;
use App\Models\Audio;

class MessageController extends BaseController
{
    public function viewMessages()
    {

        $username = $_GET['q'] ?? '';
        if (!$username) {
           die("Invalid URL");
        }

        $messageModel = new Message();
        $messages = $messageModel->getMessages($username);

        $isOwner = isset($_SESSION['user']) && password_verify($username, $_SESSION['user']['username']);

        $this->render('messages', [
            'messages' => $messages,
            'isOwner' => $isOwner,
            'username' => $username
        ]);

    }

    public function showMessages()
    {
        $this->viewMessages();
    }

    public function submitMessage()
    {
        header('Content-Type: application/json');
        $username = $_POST['username'] ?? '';
        $text = $_POST['message'] ?? '';
        $time = date('Y-m-d H:i:s');

        $messageModel = new Message();

        // Handle file uploads first
        $storage = StorageFactory::create('local');
        $mediaUrls = [];
        $errors = [];

        if (isset($_FILES['media']) && is_array($_FILES['media']['name'])) {
            $files = $_FILES['media'];
            // return var_dump($files);
            $fileCount = count($files['name']);

            for ($i = 0; $i < $fileCount; $i++) {
                $file = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i],
                ];

                if ($file['error'] === 0) {
                    $mediaUrl = $storage->store($file);
                    if ($mediaUrl) {
                        $mediaUrls[] = $mediaUrl;
                    } else {
                        // Store storage error
                        $errors[] = 'Failed to store media file: ' . $file['name'];
                    }
                } else {
                    // Store upload error
                    $errors[] = 'Upload error for ' . $file['name'] . ': ' . $file['error'];
                }
            }
        }


        $messageModel->saveMessage($username, $text, $time, $mediaUrls);

        $response = ['success' => true];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        echo json_encode($response);

    }
}
