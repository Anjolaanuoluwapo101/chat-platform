<?php

namespace App\Database;

interface DatabaseInterface
{
    // Connection
    public function connect();

    // User management
    public function getUser($username);
    public function getUserById($userId);
    public function saveUser($user);
    public function updateUser($username, $data);

    // Message management
    public function getMessages($username);
    public function saveMessage($message);
    public function getMessageById($messageId, $groupId);

    // Media management
    public function savePhoto($media);
    public function saveVideo($media);
    public function saveAudio($media);
    public function getPhotos($messageId);
    public function getVideos($messageId);
    public function getAudios($messageId);

    // Group support
    public function createGroup($name, $isAnonymous = true);
    public function getGroupInfo($groupId);
    public function getGroupMembers($groupId);
    public function addGroupMember($groupId, $userId);
    public function removeGroupMember($groupId, $userId);
    public function isUserInGroup($groupId, $userId);
    public function updateGroupSettings($groupId, $settings);
    public function deleteGroup($groupId);

    // Group admin operations
    public function addAdmin($groupId, $userId);
    public function removeAdmin($groupId, $userId);
    public function isAdmin($groupId, $userId);
    public function getGroupAdmins($groupId);

    // Group moderation
    public function banUser($groupId, $userId);
    public function unbanUser($groupId, $userId);
    public function getBannedUsers($groupId);

    // Group messaging
    public function getGroupMessagesPaginated($groupId, $limit = 50, $beforeMessageId = null, $direction);
    public function markMessagesRead($groupId, $userId, $lastMessageId);
    public function getLastReadMessageId($groupId, $userId);

    // User group interactions
    public function getUserGroups($userId);
}