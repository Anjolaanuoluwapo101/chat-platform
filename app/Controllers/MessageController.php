<?php

namespace App\Controllers;

use App\Models\Message;

class MessageController extends BaseController
{
    public function viewMessages()
    {
    
        $username = $_GET['q'] ?? '';
        if (!$username) {
            header('Location: login.php');
            exit();
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
        $messageModel->saveMessage($username, $text, $time);

        echo json_encode(['success' => true]);
    }
}
