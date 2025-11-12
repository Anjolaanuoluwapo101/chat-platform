<?php

namespace App\Database;

use App\Database\DatabaseInterface;
use App\Factory\DatabaseFactory;
use App\Config\Config;
use Predis\Client as PredisClient;
use App\Log\Logger;
use App\Database\SQLiteDatabase;

/**
 * RedisDatabase provides a Redis-backed fast layer for chat operations.
 * It delegates durable user/media operations to SQLite.
 */
class RedisDatabase implements DatabaseInterface
{
    private $client;
    private $logger;
    private $persistent;
    private $publishScriptSha;

    public function __construct()
    {
        $this->logger = new Logger();
        $cfg = Config::get('redis') ?? [];
        $url = $cfg['url'] ?? null;

        // Predis client expects an array or a URI string
        $options = [];
        try {
            $this->client = new PredisClient($url ?: null, $options);
        } catch (\Exception $e) {
            $this->logger->log('Redis connection failed: ' . $e->getMessage());
            $this->client = null;
        }

        // fallback durable store
        $this->persistent = DatabaseFactory::create('sqlite');

    }

    // Connection
    public function connect()
    {
        // Predis connects lazily; ping to ensure connection if available
        if ($this->client) {
            try {
                $this->client->ping();
            } catch (\Exception $e) {
                $this->logger->log('Redis ping failed: ' . $e->getMessage());
            }
        }
    }

    // User management
    public function getUser($username)
    {
        return $this->persistent->getUser($username);
    }

    public function getUserById($userId)
    {
        return $this->persistent->getUserById($userId);
    }

    public function saveUser($user)
    {
        return $this->persistent->saveUser($user);
    }

    public function updateUser($username, $data)
    {
        return $this->persistent->updateUser($username, $data);
    }

    // Message management
    public function getMessages($username)
    {
        return $this->persistent->getMessages($username);
    }

    /**
     * Save message durable in sqlite then publish/update redis structures for fast reads.
     * Analogy: SQLite is the "chat history archive" (permanent storage), Redis is the "live chat board" (instant display for active users)
     */
    public function saveMessage($message)
    {
        // Step 1: Store message permanently in the "chat history archive"
        $messageId = $this->persistent->saveMessage($message);

        if (!empty($message['media_urls'])) {
            foreach ($message['media_urls'] as $mediaUrl) {
                //obtain the extension 
                $extension = pathinfo($mediaUrl, PATHINFO_EXTENSION);
                if (in_array($extension, ['png', 'jpg', 'jpeg', 'gif', 'webp'])) {
                    $this->savePhoto(['message_id' => $messageId, 'file_path' => $mediaUrl]);
                } elseif (in_array($extension, ['mp4', 'mkv', 'avi', 'mov', 'wmv'])) {
                    $this->saveVideo(['message_id' => $messageId, 'file_path' => $mediaUrl]);
                } elseif (in_array($extension, ['mp3', 'wav', 'ogg'])) {
                    $this->saveAudio(['message_id' => $messageId, 'file_path' => $mediaUrl]);
                }
            }
        }
        ;

        // Generate a random message ID of numbers
        // $messageId = rand(100000, 999999);


        $groupId = $message['group_id'] ?? null;

        // Step 3: Only update the "live chat board" if Redis is available and this is a group message
        if ($this->client && $groupId) {
            try {

                // Step 2: Prepare the message for display on the "live chat board" (Redis) - create a lightweight version for fast access
                $payload = [
                    'id' => $messageId,
                    'username' => $message['username'] ?? null,
                    'content' => $message['content'] ?? null,
                    'media_urls' => $message['media_urls'] ?? null,
                    'created_at' => date('c'),
                    'group_id' => $message['group_id'] ?? null,
                    'reply_to_message_id' => $message['reply_to_message_id'] ?? null,
                ];

                // If this is a reply, include the parent message data for performance
                if (!empty($message['reply_to_message_id'])) {
                    // Check if parent message data is already provided in the message array
                    // if (!empty($message['replied_message_username']) && !empty($message['replied_message_content'])) {
                    $payload['replied_message_username'] = $message['replied_message_username'];
                    $payload['replied_message_content'] = $message['replied_message_content'];
                    $payload['replied_message_created_at'] = $message['replied_message_created_at'] ?? date('c');
                    // Include media URLs if available
                    if (!empty($message['replied_message_media_urls'])) {
                        $payload['replied_message_media_urls'] = $message['replied_message_media_urls'];
                    }
                    // }
                }

                if (!empty($message['media_urls'])) {
                    $payload['media_urls'] = $message['media_urls'];
                }
                //check group meta via redis if group chat is anonymous
                $groupId = $message['group_id'] ?? null;
                if ($groupId) {
                    $groupMeta = $this->client->hgetall("group:{$groupId}:meta");
                    if (!empty($groupMeta) && !empty($groupMeta['is_anonymous'])) {
                        $payload['username'] = 'Anonymous';
                    }
                }

                $keyMessages = "group:{$groupId}:messages";  // The main message display board
                $keyMeta = "group:{$groupId}:meta";          // The info sign showing latest activity
                $keyUnread = "group:{$groupId}:unread";      // The counter showing unread messages per user

                $msgJson = json_encode($payload);

                // Get the current group members to update their "live chat board" views
                if (!is_null($groupId)) {
                    $members = $this->persistent->getGroupMembers($groupId) ?: [];
                }

                // Load the "posting script" for atomic updates (like posting to multiple bulletin boards at once)
                if (!$this->publishScriptSha) {
                    $script = file_get_contents(__DIR__ . '/scripts/publish_message.lua');
                    try {
                        $this->publishScriptSha = $this->client->script('load', $script);
                    } catch (\Exception $e) {
                        // If the "posting script" isn't available, we'll do it manually
                        $this->logger->log('Redis script load failed: ' . $e->getMessage());
                        $this->publishScriptSha = null;
                    }
                }

                if ($this->publishScriptSha) {
                    // Use the "posting script" to atomically update all bulletin boards at once
                    $ts = (string) time();
                    // Extract user IDs from members array for the script
                    $memberIds = array_map(function ($member) {
                        return is_array($member) ? (string) $member['id'] : (string) $member;
                    }, $members);
                    $argv = array_merge([$msgJson, $ts, substr($payload['content'] ?? '', 0, 200), (string) $groupId, (string) $messageId], $memberIds);
                    // KEYS are messages, meta, unread, msg_to_stream - the four bulletin board sections we need to update
                    $keyMapping = "group:{$groupId}:msg_to_stream";
                    $res = $this->client->evalsha($this->publishScriptSha, 4, $keyMessages, $keyMeta, $keyUnread, $keyMapping, ...$argv);
                } else {
                    // Manual posting: Update each bulletin board section one by one (less efficient but works)
                    $this->client->multi();  // Start a transaction - all updates happen together or not at all

                    $streamId = $this->client->xadd($keyMessages, ['data' => $msgJson], '*');

                    // Store mapping from message_id to stream_id for pagination
                    $keyMapping = "group:{$groupId}:msg_to_stream";
                    $this->client->hset($keyMapping, $messageId, $streamId);

                    // Update the info sign with the latest message details
                    $this->client->hset($keyMeta, 'last_message_id', $messageId);
                    $this->client->hset($keyMeta, 'last_message_ts', time());
                    $this->client->hset($keyMeta, 'last_message_summary', substr($payload['content'] ?? '', 0, 200));

                    // For each group member, increment their personal unread counter and update their group activity
                    foreach ($members as $member) {
                        $memberId = is_array($member) ? $member['id'] : $member;
                        $this->client->hincrby($keyUnread, $memberId, 1);  // Increment unread count for this user
                        $userGroupsKey = "user:{$memberId}:groups";        // Their personal "recent groups" board
                        $this->client->zadd($userGroupsKey, [$groupId => time()]);  // Move this group to the top of their recent list
                    }

                    $this->client->exec();  // Execute all updates atomically
                }
            } catch (\Exception $e) {
                $this->logger->log('Redis saveMessage failed: ' . $e->getMessage());
            }
        }

        return $messageId;
    }

    /**
     * Get message data for a specific message ID
     */
    public function getMessageById($messageId, $groupId = null)
    {
        //redis equivallent
        if (!$this->client) {
            return $this->persistent->getMessageById($messageId, $groupId);
        }
        try {
            //get the stream id from the message id
            $keyMapping = "group:{$groupId}:msg_to_stream";
            $streamId = $this->client->hget($keyMapping, $messageId);
            echo "here";
            if ($streamId) {
                //get the message data from the stream id
                $keyMessages = "group:{$groupId}:messages";

                $messageData = $this->client->xrange($keyMessages, $streamId, $streamId, 1);

                if ($messageData) {
                    return json_decode($messageData[$streamId]["data"], true);
                }
            }
        } catch (\Exception $e) {
            $this->logger->log('Redis getMessageById failed: ' . $e->getMessage());
            return $this->persistent->getMessageById($messageId, $groupId); //will create the redis equivalent later
        }
    }

    // Media methods delegate to sqlite (durable storage)
    public function savePhoto($media)
    {
        return $this->persistent->savePhoto($media);
    }

    public function saveVideo($media)
    {
        return $this->persistent->saveVideo($media);
    }

    public function saveAudio($media)
    {
        return $this->persistent->saveAudio($media);
    }

    public function getPhotos($messageId)
    {
        return $this->persistent->getPhotos($messageId);
    }

    public function getVideos($messageId)
    {
        return $this->persistent->getVideos($messageId);
    }

    public function getAudios($messageId)
    {
        return $this->persistent->getAudios($messageId);
    }

    // Group management
    public function createGroup($name, $isAnonymous = true)
    {
        // Create in sqlite first to get id
        try {
            $groupId = null;
            $pdoGroupId = $this->persistent->createGroup($name, $isAnonymous);
            if ($pdoGroupId) {
                $groupId = $pdoGroupId;
            }

            if ($this->client && $groupId) {
                $keyMeta = "group:{$groupId}:meta";
                $this->client->hset($keyMeta, 'id', $groupId);
                $this->client->hset($keyMeta, 'name', $name);
                $this->client->hset($keyMeta, 'is_anonymous', $isAnonymous ? 1 : 0);
                $this->client->hset($keyMeta, 'created_at', time());
            }

            return $groupId;
        } catch (\Exception $e) {
            $this->logger->log('createGroup failed: ' . $e->getMessage());
            return false;
        }
    }

    public function getGroupInfo($groupId)
    {
        if ($this->client) {
            try {
                $keyMeta = "group:{$groupId}:meta";
                $meta = $this->client->hgetall($keyMeta);
                return $meta ?: $this->persistent->getGroupInfo($groupId);
            } catch (\Exception $e) {
                $this->logger->log('Redis getGroup failed: ' . $e->getMessage());
            }
        }
        return $this->persistent->getGroupInfo($groupId);
    }

    public function updateGroupSettings($groupId, $settings)
    {
        $ok = $this->persistent->updateGroupSettings($groupId, $settings);
        if ($ok && $this->client) {
            try {
                $keyMeta = "group:{$groupId}:meta";
                $metaData = [];
                foreach ($settings as $key => $value) {
                    $metaData[$key] = $value;
                }
                if (!empty($metaData)) {
                    $this->client->hmset($keyMeta, $metaData);
                }
            } catch (\Exception $e) {
                $this->logger->log('Redis updateGroupSettings failed: ' . $e->getMessage());
            }
        }
        return $ok;
    }

    // public function deleteGroup($groupId)
    // {
    //     $ok = $this->persistent->deleteGroup($groupId);
    //     if ($ok && $this->client) {
    //         try {
    //             // Delete Redis keys for the group
    //             $keys = [
    //                 "group:{$groupId}:messages",
    //                 "group:{$groupId}:meta",
    //                 "group:{$groupId}:unread",
    //                 "group:{$groupId}:members",
    //                 "group:{$groupId}:admins",
    //                 "group:{$groupId}:lastread",
    //                 "group:{$groupId}:msg_to_stream"
    //             ];
    //             $this->client->del($keys);
    //         } catch (\Exception $e) {
    //             $this->logger->log('Redis deleteGroup failed: ' . $e->getMessage());
    //         }
    //     }
    //     return $ok;
    // }

    public function deleteGroup($groupId)
    {
        $ok = $this->persistent->deleteGroup($groupId);
        if ($ok && $this->client) {
            try {
                // First, remove the group from all user group lists using Lua script
                $keyMembers = "group:{$groupId}:members";

                // Load and execute the remove_group_members.lua script
                $scriptPath = __DIR__ . '/scripts/remove_group_members.lua';
                if (file_exists($scriptPath)) {
                    $script = file_get_contents($scriptPath);
                    try {
                        $scriptSha = $this->client->script('load', $script);
                        $this->client->evalsha($scriptSha, 1, $keyMembers, $groupId);
                    } catch (\Exception $e) {
                        // If script loading fails, fall back to manual removal
                        $this->logger->log('Redis script load failed: ' . $e->getMessage());
                        $this->removeGroupFromUserLists($groupId);
                    }
                } else {
                    // If script doesn't exist, fall back to manual removal
                    $this->removeGroupFromUserLists($groupId);
                }

                // Delete Redis keys for the group
                $keys = [
                    "group:{$groupId}:messages",
                    "group:{$groupId}:meta",
                    "group:{$groupId}:unread",
                    "group:{$groupId}:members",
                    "group:{$groupId}:admins",
                    "group:{$groupId}:lastread",
                    "group:{$groupId}:msg_to_stream"
                ];
                $this->client->del($keys);
            } catch (\Exception $e) {
                $this->logger->log('Redis deleteGroup failed: ' . $e->getMessage());
            }
        }
        return $ok;
    }


    // Group membership
    public function addGroupMember($groupId, $userId)
    {
        $ok = $this->persistent->addGroupMember($groupId, $userId);
        if ($ok && $this->client) {
            try {
                // Get username for the user
                $user = $this->persistent->getUserById($userId);
                if ($user) {
                    $username = $user['username'];
                    // Store user ID to username mapping in Redis hash
                    $keyMembers = "group:{$groupId}:members";
                    $this->client->hset($keyMembers, $userId, $username);
                    // add to user's group zset
                    $userGroupsKey = "user:{$userId}:groups";
                    $this->client->zadd($userGroupsKey, [$groupId => time()]);
                }
            } catch (\Exception $e) {
                $this->logger->log('Redis addGroupMember failed: ' . $e->getMessage());
            }
        }
        return $ok;
    }

    /**
     * Remove a member from a group
     */
    public function removeGroupMember($groupId, $userId)
    {
        $ok = $this->persistent->removeGroupMember($groupId, $userId);
        if ($ok && $this->client) {
            try {
                // Remove user ID from username mapping in Redis hash
                $keyMembers = "group:{$groupId}:members";
                $this->client->hdel($keyMembers, [$userId]);
                // remove from user's group zset
                $userGroupsKey = "user:{$userId}:groups";
                $this->client->zrem($userGroupsKey, $groupId);
            } catch (\Exception $e) {
                $this->logger->log('Redis removeGroupMember failed: ' . $e->getMessage());
            }
        }
    }
    /*
     * Remove all group members from a group
     */
    private function removeGroupFromUserLists($groupId)
    {
        try {
            // Get all members of the group
            $keyMembers = "group:{$groupId}:members";
            $memberData = $this->client->hgetall($keyMembers);

            // Remove the group from each user's group list
            foreach ($memberData as $userId => $username) {
                $userGroupsKey = "user:{$userId}:groups";
                $this->client->zrem($userGroupsKey, $groupId);
            }
        } catch (\Exception $e) {
            $this->logger->log('Redis removeGroupFromUserLists failed: ' . $e->getMessage());
        }
    }

    /*
     * Check if a user is in a group
     */
    public function isUserInGroup($groupId, $userId)
    {
        if ($this->client) {
            try {
                $keyMembers = "group:{$groupId}:members";
                // Check if user ID exists in the hash
                $username = $this->client->hget($keyMembers, $userId);
                return $username !== null;
            } catch (\Exception $e) {
                // fallback to sqlite
            }
        }
        return $this->persistent->isUserInGroup($groupId, $userId);
    }

    public function getGroupMembers($groupId)
    {
        if ($this->client) {
            try {
                $keyMembers = "group:{$groupId}:members";
                $memberData = $this->client->hgetall($keyMembers);

                if (empty($memberData)) {
                    return [];
                }

                $members = [];
                foreach ($memberData as $userId => $username) {
                    $members[] = [
                        'id' => (int) $userId,
                        'username' => $username
                    ];
                }

                return $members;
            } catch (\Exception $e) {
                $this->logger->log('Redis getGroupMembers failed: ' . $e->getMessage());
            }
        }
        return $this->persistent->getGroupMembers($groupId);
    }

    // Group admin operations
    public function addAdmin($groupId, $userId)
    {
        $ok = $this->persistent->addAdmin($groupId, $userId);
        if ($ok && $this->client) {
            try {
                // Get username for the user
                $user = $this->persistent->getUserById($userId);
                if ($user) {
                    $username = $user['username'];
                    // Store user ID to username mapping in Redis hash
                    $keyAdmins = "group:{$groupId}:admins";
                    $this->client->hset($keyAdmins, $userId, $username);
                }
            } catch (\Exception $e) {
                $this->logger->log('Redis addAdmin failed: ' . $e->getMessage());
            }
        }
        return $ok;
    }

    public function removeAdmin($groupId, $userId)
    {
        $ok = $this->persistent->removeAdmin($groupId, $userId);
        if ($ok && $this->client) {
            try {
                $keyAdmins = "group:{$groupId}:admins";
                $this->client->hdel($keyAdmins, [$userId]);
            } catch (\Exception $e) {
                $this->logger->log('Redis removeAdmin failed: ' . $e->getMessage());
            }
        }
        return $ok;
    }

    public function isAdmin($groupId, $userId)
    {
        if ($this->client) {
            try {
                $keyAdmins = "group:{$groupId}:admins";
                // Check if user ID exists in the hash
                $username = $this->client->hget($keyAdmins, $userId);
                return $username !== null;
            } catch (\Exception $e) {
                // fallback to sqlite
            }
        }
        return $this->persistent->isAdmin($groupId, $userId);
    }

    public function getGroupAdmins($groupId)
    {
        if ($this->client) {
            try {
                $keyAdmins = "group:{$groupId}:admins";
                $adminData = $this->client->hgetall($keyAdmins);

                if (empty($adminData)) {
                    return [];
                }

                $admins = [];
                foreach ($adminData as $userId => $username) {
                    $admins[] = [
                        'id' => (int) $userId,
                        'username' => $username
                    ];
                }

                return $admins;
            } catch (\Exception $e) {
                $this->logger->log('Redis getGroupAdmins failed: ' . $e->getMessage());
            }
        }
        return $this->persistent->getGroupAdmins($groupId);
    }

    public function promoteToAdmin($groupId, $userId)
    {
        return $this->addAdmin($groupId, $userId);
    }

    public function demoteAdmin($groupId, $userId)
    {
        return $this->removeAdmin($groupId, $userId);
    }

    // Group moderation
    public function banUser($groupId, $userId)
    {
        $ok = $this->persistent->banUser($groupId, $userId);
        if ($ok && $this->client) {
            try {
                $keyBans = "group:{$groupId}:bans";
                $this->client->sadd($keyBans, [$userId]);
            } catch (\Exception $e) {
                $this->logger->log('Redis banUser failed: ' . $e->getMessage());
            }
        }
        return $ok;
    }

    public function unbanUser($groupId, $userId)
    {
        $ok = $this->persistent->unbanUser($groupId, $userId);
        if ($ok && $this->client) {
            try {
                $keyBans = "group:{$groupId}:bans";
                $this->client->srem($keyBans, [$userId]);
            } catch (\Exception $e) {
                $this->logger->log('Redis unbanUser failed: ' . $e->getMessage());
            }
        }
        return $ok;
    }

    public function getBannedUsers($groupId)
    {
        if ($this->client) {
            try {
                // For now, we'll just return the SQLite implementation
                // In a more advanced implementation, we could store banned users in Redis as well
                return $this->persistent->getBannedUsers($groupId);
            } catch (\Exception $e) {
                $this->logger->log('Redis getBannedUsers failed: ' . $e->getMessage());
            }
        }
        return $this->persistent->getBannedUsers($groupId);
    }

    // Group messaging
    /**
     * Get a user's groups sorted by recent activity, with unread counts
     * Analogy: Like checking your personal "recent conversations" board to see which chat rooms have new activity
     */
    public function getUserGroups($userId)
    {
        if (!$this->client) {
            return $this->persistent->getUserGroups($userId);
        }

        try {
            $userGroupsKey = "user:{$userId}:groups";  // Your personal "recent groups" bulletin board
            // Read the groups from your personal board, sorted by most recent activity first (like most recent conversations at the top)
            $groups = $this->client->zrevrange($userGroupsKey, 0, -1, ['WITHSCORES' => true]);

            if (!$groups) {
                return [];  // No groups on your personal board yet
            }

            $result = [];
            foreach ($groups as $groupId => $lastActivity) {
                $keyMeta = "group:{$groupId}:meta";     // The group's info sign
                $keyUnread = "group:{$groupId}:unread"; // The unread counter for this group

                // Check both the group's info sign and your unread counter at the same time (efficient!)
                $responses = $this->client->pipeline(function ($pipe) use ($keyMeta, $keyUnread, $userId) {
                    $pipe->hgetall($keyMeta);        // Read the group's info sign
                    $pipe->hget($keyUnread, $userId); // Check your unread count for this group
                });

                $meta = $responses[0] ?: [];           // Group info from the sign
                $unreadCount = (int) ($responses[1] ?: 0); // Your unread messages in this group

                if (!empty($meta)) {
                    $result[] = [
                        'id' => $groupId,
                        'name' => $meta['name'] ?? '',                    // Group name from the info sign
                        'last_message_summary' => $meta['last_message_summary'] ?? '', // Preview of latest message
                        'last_message_ts' => (int) ($meta['last_message_ts'] ?? 0),     // When the last message was posted
                        'unread_count' => $unreadCount                               // How many messages you haven't read yet
                    ];
                }
            }

            return $result;  // Your complete "recent conversations" list with all the details
        } catch (\Exception $e) {
            $this->logger->log('Redis getUserGroups failed: ' . $e->getMessage());
            return $this->persistent->getUserGroups($userId);  // Fallback to the permanent archive if the live board fails
        }
    }

    /**
     * Get paginated messages for a group, optionally starting from a specific message
     */
    public function getGroupMessagesPaginated($groupId, $limit = 50, $referenceMessageId = null, $direction = 'before')
    {
        if (!$this->client) {
            return $this->persistent->getGroupMessagesPaginated($groupId, $limit, $referenceMessageId, $direction);
        }

        try {
            $keyMessages = "group:{$groupId}:messages";
            $keyMapping = "group:{$groupId}:msg_to_stream";

            if ($referenceMessageId) {
                // Get the Redis stream ID for this message
                $streamId = $this->client->hget($keyMapping, $referenceMessageId);

                if (!$streamId) {
                    // Message not in Redis, fallback to SQLite
                    return $this->persistent->getGroupMessagesPaginated($groupId, $limit, $referenceMessageId, $direction);
                }

                if ($direction === 'after') {
                    // Get messages AFTER this stream ID (newer messages)
                    // XRANGE: key start end [COUNT count]
                    $streamMessages = $this->client->xrange(
                        $keyMessages,
                        $streamId,        // Start from this ID (inclusive)
                        '+',              // To the end (newest)
                        (int) $limit       // Get one extra to exclude reference
                    );
                    // Remove the first item (the reference message itself)
                    if (count($streamMessages) > 0 && isset($streamMessages[0])) {
                        array_shift($streamMessages);
                    }
                } else {
                    // Get messages BEFORE this stream ID (older messages) - DEFAULT
                    $streamMessages = $this->client->xrevrange(
                        $keyMessages,
                        $streamId,        // Start from this ID (inclusive)
                        '-',              // To the beginning (oldest)
                        $limit + 1        // Get one extra to exclude reference
                    );
                    // Remove the first item (the reference message itself)
                    if (count($streamMessages) > 0 && isset($streamMessages[0])) {
                        array_shift($streamMessages);
                    }
                    // Normalize to chronological order (oldest → newest)
                    $streamMessages = array_reverse($streamMessages);
                }
            } else {
                // No reference - get LATEST messages (default behavior)
                $streamMessages = $this->client->xrevrange(
                    $keyMessages,
                    '+',              // From newest
                    '-',              // To oldest
                    (int) $limit            // Just get the limit
                );
                // Normalize to chronological order (oldest → newest)
                $streamMessages = array_reverse($streamMessages);
            }

            // Extract message data from stream entries
            $messages = [];
            foreach ($streamMessages as $entry) {
                if (isset($entry['data'])) {
                    $messages[] = json_decode($entry['data'], true);
                }else{
                    $messages[] = [];  
                }
            }

            return $messages;
        } catch (\Exception $e) {
            $this->logger->log('Redis getGroupMessagesPaginated failed: ' . $e->getMessage());
            return $this->persistent->getGroupMessagesPaginated($groupId, $limit, $referenceMessageId, $direction);
        }
    }

    /**
     * Mark messages as read up to a specific message and reset unread count
     */
    public function markMessagesRead($groupId, $userId, $lastMessageId)
    {
        if (!$this->client) {
            return $this->persistent->markMessagesRead($groupId, $userId, $lastMessageId);
        }

        try {
            $keyUnread = "group:{$groupId}:unread";
            $keyLastRead = "group:{$groupId}:lastread";

            // Update last read pointer and reset unread count atomically
            $this->client->multi();
            $this->client->hset($keyLastRead, $userId, $lastMessageId);
            $this->client->hdel($keyUnread, [$userId]);
            $result = $this->client->exec();

            return !empty($result);
        } catch (\Exception $e) {
            $this->logger->log('Redis markMessagesRead failed: ' . $e->getMessage());
            return $this->persistent->markMessagesRead($groupId, $userId, $lastMessageId);
        }
    }

    /**
     * Get the last read message ID for a user in a group
     */
    public function getLastReadMessageId($groupId, $userId)
    {
        if (!$this->client) {
            return $this->persistent->getLastReadMessageId($groupId, $userId);
        }

        try {
            $keyLastRead = "group:{$groupId}:lastread";
            $lastReadId = $this->client->hget($keyLastRead, $userId);
            return $lastReadId ? (int) $lastReadId : null;
        } catch (\Exception $e) {
            $this->logger->log('Redis getLastReadMessageId failed: ' . $e->getMessage());
            return $this->persistent->getLastReadMessageId($groupId, $userId);
        }
    }
}