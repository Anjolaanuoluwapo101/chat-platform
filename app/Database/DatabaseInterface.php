<?php

namespace App\Database;

interface DatabaseInterface
{
    public function connect();
    public function getUser($username);
    public function getUserById($userId);
    public function saveUser($user);
    public function getMessages($username);
    public function saveMessage($message);
    public function updateUser($username, $data);

    // Group support
    public function createGroup($name, $isAnonymous = true);
    public function addAdmin($groupId, $userId);
    public function addGroupMember($groupId, $userId);
    public function isUserInGroup($groupId, $userId);
    public function getGroup($groupId);
    public function getGroupMembers($groupId);

    public function savePhoto($media);
    public function saveVideo($media);
    public function saveAudio($media);

    public function getPhotos($messageId);
    public function getVideos($messageId);
    public function getAudios($messageId);

    // Redis-backed fast operations
    public function getUserGroups($userId);
    public function getGroupMessagesPaginated($groupId, $requestingUserId, $limit = 50, $beforeMessageId = null);
    public function markMessagesRead($groupId, $userId, $lastMessageId);
}