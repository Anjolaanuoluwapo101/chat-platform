<?php

namespace App\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Services\PusherService;
use App\Services\ChannelManager;
use App\Services\Beams;
use App\Log\Logger;
use App\Traits\PusherTrait;

/**
 * MessageController handles message viewing, submission, and Pusher authentication.
 */
class MessageController extends BaseController
{
    use PusherTrait;
    private $logger;

    public function __construct()
    {
        parent::__construct();
        $this->logger = new Logger();
    }


    /**
     * API endpoint to get messages for a username.
     */
    public function viewMessages()
    {
        // Authenticate user for viewing messages
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }


        $username = $_GET['username'] ?? '';

        $messageModel = new Message();

        if (!$username) {
            $this->jsonResponse(['error' => 'Username parameter required'], 400);
            return;
        }

        $messages = $messageModel->getMessages($username);
        // reverse the array to get the latest messages first
        $messages = array_reverse($messages);
        $isOwner = $username === $user['username'];

        $this->jsonResponse([
            'success' => true,
            'messages' => $messages,
            'isOwner' => $isOwner
        ]);
    }

    /**
     * API endpoint to submit a new message.
     * Supports both individual and group messages.
     */
    public function submitMessage()
    {
        try {
            //$input = json_decode(file_get_contents('php://input'), true);
            $input = $_POST;

            $username = $input['username'] ?? ''; //receiver of the message not the sender ...okayyyyy
            
            $text = $input['content'] ?? '';
            $time = date('Y-m-d H:i:s');

            if (!$username || !$text) {
                $this->jsonResponse(['success' => false, 'errors' => ['general' => 'Username and message are required']], 400);
                return;
            }

            $messageModel = new Message();

            // Handle file uploads using the base class method
            $fileProcessingResult = $this->processUploadedFiles();
            $mediaUrls = $fileProcessingResult['mediaUrls'];
            $errors = $fileProcessingResult['errors'];

            $messageId = $messageModel->saveMessage($username, $text, $time, $mediaUrls, null , null, null );

            // Handle Pusher event
            $pusherResult = $this->handlePusherEvent($username, $text, $time, $mediaUrls, $messageId);
            $channel = $pusherResult['channel'];
            $channelInfo = $pusherResult['channelInfo'];

            //Handle Beam 
            //get the user id of the username
            $user = (new User)->getByUsername($username) ;
            if(is_array($user)){
                $userId = $user['id'];
                $this->handleBeamsEvent($userId, $text, $time, null);
            }

            $response = [
                'success' => true,
                'message' => 'Message sent',
                'channel' => $channel,
                'is_private' => $channelInfo['isPrivate']
            ];
            if (!empty($errors)) {
                $response['errors'] = $errors;
            }
            $this->jsonResponse($response);
        } catch (\Exception $e) {
            $this->logger->error("Message submission error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'errors' => ['general' => 'An error occurred while sending the message.']], 500);
        }
    }

    /**
     * Handle Pusher event for real-time updates
     */
    private function handlePusherEvent($username, $text, $time, $mediaUrls, $messageId)
    {
        // Use ChannelManager to get the appropriate channel
        $channelManager = new ChannelManager();
        // $identifier = $username;
        $channelInfo = $channelManager->getChannel('individual', $username);
        $channel = $channelInfo['name'];

        // Trigger Pusher event for real-time updates
        $pusherService = new PusherService();
        $eventData = [
            'id' => $messageId,
            'username' => $username,  //the username here is the receiver of the message
            'content' => htmlspecialchars($text),
            'created_at' => $time,
            'media_urls' => $mediaUrls
        ];
        $pusherService->triggerEvent($channel, 'new-message', $eventData);

        return [
            'channel' => $channel,
            'channelInfo' => $channelInfo
        ];
    }

    private function handleBeamsEvent($userId, $text, $time, $url){
        //call sendToUser method from Beams class
        $beams = new Beams();
        $beams->sendToUser($userId, "New Message!", $text." at ".$time, null);
    }
}