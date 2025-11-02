<?php

namespace App\Database;

interface DatabaseInterface
{
    public function connect();
    public function getUser($username);
    public function saveUser($user);
    public function getMessages($username);
    public function saveMessage($message);
    public function updateUser($username, $data);

    // Group support
    public function createGroup($name);
    public function addGroupMember($groupId, $userId);
    public function isUserInGroup($groupId, $userId);
    public function getGroupMessages($groupId, $requestingUserId);
    public function getGroup($groupId);

    public function savePhoto($media);
    public function saveVideo($media);
    public function saveAudio($media);

    public function getPhotos($messageId);
    public function getVideos($messageId);
    public function getAudios($messageId);

}