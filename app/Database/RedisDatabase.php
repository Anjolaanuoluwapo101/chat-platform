<?php

namespace App\Database;

use App\Database\DatabaseInterface;
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
    private $sqlite;
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
        $this->sqlite = new SQLiteDatabase();
    }

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

    public function getUser($username)
    {
        return $this->sqlite->getUser($username);
    }

    public function getUserById($userId)
    {
        return $this->sqlite->getUserById($userId);
    }

    public function saveUser($user)
    {
        return $this->sqlite->saveUser($user);
    }

    public function getMessages($username)
    {
        return $this->sqlite->getMessages($username);
    }

    /**
     * Save message durable in sqlite then publish/update redis structures for fast reads.
     * Analogy: SQLite is the "chat history archive" (permanent storage), Redis is the "live chat board" (instant display for active users)
     */
    public function saveMessage($message)
    {
        // Step 1: Store message permanently in the "chat history archive" (SQLite) first - this is our source of truth
        $messageId = $this->sqlite->saveMessage($message);
        if (!$messageId) {
            return false;
        }

        // Step 2: Prepare the message for display on the "live chat board" (Redis) - create a lightweight version for fast access
        $payload = [
            'id' => $messageId,
            'username' => $message['username'] ?? null,
            'content' => $message['content'] ?? null,
            'created_at' => date('c'),
            'group_id' => $message['group_id'] ?? null,
        ];

        if (!empty($message['media_urls'])) {
            $payload['media_urls'] = $message['media_urls'];
        }

        $groupId = $message['group_id'] ?? null;

        // Step 3: Only update the "live chat board" if Redis is available and this is a group message
        if ($this->client && $groupId) {
            try {
                // Define the "bulletin board sections" for this group chat room
                $keyMessages = "group:{$groupId}:messages";  // The main message display board
                $keyMeta = "group:{$groupId}:meta";          // The info sign showing latest activity
                $keyUnread = "group:{$groupId}:unread";      // The counter showing unread messages per user

                $msgJson = json_encode($payload);

                // Get the current group members to update their "live chat board" views
                if(!is_null($groupId)) {
                    $members = $this->sqlite->getGroupMembers($groupId) ?: [];
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
                    $ts = (string)time();
                    $argv = array_merge([$msgJson, $ts, substr($payload['content'] ?? '', 0, 200), (string)$groupId, (string)$messageId], array_map('strval', $members));
                    // KEYS are messages, meta, unread, msg_to_stream - the four bulletin board sections we need to update
                    $keyMapping = "group:{$groupId}:msg_to_stream";
                    $res = $this->client->evalsha($this->publishScriptSha, 4, $keyMessages, $keyMeta, $keyUnread, $keyMapping, ...$argv);
                } else {
                    // Manual posting: Update each bulletin board section one by one (less efficient but works)
                    $this->client->multi();  // Start a transaction - all updates happen together or not at all

                    // Post the message to the stream (replaces RPUSH)
                    $streamId = $this->client->xadd($keyMessages,  ['data' => $msgJson],'*');

                    // Store mapping from message_id to stream_id for pagination
                    $keyMapping = "group:{$groupId}:msg_to_stream";
                    $this->client->hset($keyMapping, $messageId, $streamId);

                    // Update the info sign with the latest message details
                    $this->client->hset($keyMeta, 'last_message_id', $messageId);
                    $this->client->hset($keyMeta, 'last_message_ts', time());
                    $this->client->hset($keyMeta, 'last_message_summary', substr($payload['content'] ?? '', 0, 200));

                    // For each group member, increment their personal unread counter and update their group activity
                    foreach ($members as $memberId) {
                        $this->client->hincrby($keyUnread, $memberId, 1);  // Increment unread count for this user
                        $userGroupsKey = "user:{$memberId}:groups";        // Their personal "recent groups" board
                        $this->client->zadd($userGroupsKey, [ $groupId => time() ]);  // Move this group to the top of their recent list
                    }

                    $this->client->exec();  // Execute all updates atomically
                }
            } catch (\Exception $e) {
                $this->logger->log('Redis saveMessage failed: ' . $e->getMessage());
            }
        }

        return $messageId;
    }

    public function updateUser($username, $data)
    {
        return $this->sqlite->updateUser($username, $data);
    }

    public function createGroup($name, $isAnonymous = true)
    {
        // Create in sqlite first to get id
        try {
            $groupId = null;
            $pdoGroupId = $this->sqlite->createGroup($name, $isAnonymous);
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

    public function addGroupMember($groupId, $userId)
    {
        $ok = $this->sqlite->addGroupMember($groupId, $userId);
        if ($ok && $this->client) {
            try {
                $keyMembers = "group:{$groupId}:members";
                $this->client->sadd($keyMembers, [$userId]);
                // add to user's group zset
                $userGroupsKey = "user:{$userId}:groups";
                $this->client->zadd($userGroupsKey, [ $groupId => time() ]);
            } catch (\Exception $e) {
                $this->logger->log('Redis addGroupMember failed: ' . $e->getMessage());
            }
        }
        return $ok;
    }

    public function addAdmin($groupId, $userId)
    {
        //$ok = $this->sqlite->addAdmin($groupId, $userId);
        if($this->client){
            try{
                $keyAdmins = "group:{$groupId}:admins";
                $this->client->sadd($keyAdmins, [$userId]);
            } catch (\Exception $e) {
                $this->logger->log('Redis addAdmin failed: ' . $e->getMessage());
            }
        }
        return true;
    }

    public function isUserInGroup($groupId, $userId)
    {
        if ($this->client) {
            try {
                $keyMembers = "group:{$groupId}:members";
                $is = $this->client->sismember($keyMembers, $userId);
                return (bool)$is;
            } catch (\Exception $e) {
                // fallback to sqlite
            }
        }
        return $this->sqlite->isUserInGroup($groupId, $userId);
    }

    public function getGroup($groupId)
    {
        if ($this->client) {
            try {
                $keyMeta = "group:{$groupId}:meta";
                $meta = $this->client->hgetall($keyMeta);
                return $meta ?: $this->sqlite->getGroup($groupId);
            } catch (\Exception $e) {
                $this->logger->log('Redis getGroup failed: ' . $e->getMessage());
            }
        }
        return $this->sqlite->getGroup($groupId);
    }

    public function getGroupMembers($groupId)
    {
        if ($this->client) {
            try {
                $keyMembers = "group:{$groupId}:members";
                $members = $this->client->smembers($keyMembers);
                return array_map('intval', $members ?: []);
            } catch (\Exception $e) {
                $this->logger->log('Redis getGroupMembers failed: ' . $e->getMessage());
            }
        }
        return $this->sqlite->getGroupMembers($groupId);
    }

    // Media methods delegate to sqlite (durable storage)
    public function savePhoto($media)
    {
        return $this->sqlite->savePhoto($media);
    }

    public function saveVideo($media)
    {
        return $this->sqlite->saveVideo($media);
    }

    public function saveAudio($media)
    {
        return $this->sqlite->saveAudio($media);
    }

    public function getPhotos($messageId)
    {
        return $this->sqlite->getPhotos($messageId);
    }

    public function getVideos($messageId)
    {
        return $this->sqlite->getVideos($messageId);
    }

    public function getAudios($messageId)
    {
        return $this->sqlite->getAudios($messageId);
    }

    /**
     * Get a user's groups sorted by recent activity, with unread counts
     * Analogy: Like checking your personal "recent conversations" board to see which chat rooms have new activity
     */
    public function getUserGroups($userId)
    {
        if (!$this->client) {
            return $this->sqlite->getUserGroups($userId);
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
                $unreadCount = (int)($responses[1] ?: 0); // Your unread messages in this group

                if (!empty($meta)) {
                    $result[] = [
                        'id' => $groupId,
                        'name' => $meta['name'] ?? '',                    // Group name from the info sign
                        'last_message_summary' => $meta['last_message_summary'] ?? '', // Preview of latest message
                        'last_message_ts' => (int)($meta['last_message_ts'] ?? 0),     // When the last message was posted
                        'unread_count' => $unreadCount                               // How many messages you haven't read yet
                    ];
                }
            }

            return $result;  // Your complete "recent conversations" list with all the details
        } catch (\Exception $e) {
            $this->logger->log('Redis getUserGroups failed: ' . $e->getMessage());
            return $this->sqlite->getUserGroups($userId);  // Fallback to the permanent archive if the live board fails
        }
    }

    /**
     * Get paginated messages for a group, optionally starting from a specific message
     */
    public function getGroupMessagesPaginated($groupId, $requestingUserId, $limit = 50, $beforeMessageId = null)
    {
        if (!$this->client) {
            return $this->sqlite->getGroupMessagesPaginated($groupId, $requestingUserId, $limit, $beforeMessageId);
        }

        try {
            $keyMessages = "group:{$groupId}:messages";
            $keyMapping = "group:{$groupId}:msg_to_stream";

            if ($beforeMessageId) {
                // Get stream ID for the beforeMessageId - O(1)
                $streamId = $this->client->hget($keyMapping, $beforeMessageId);

                if (!$streamId) {
                    // Message not in Redis, fallback to SQLite
                    return $this->sqlite->getGroupMessagesPaginated($groupId, $requestingUserId, $limit, $beforeMessageId);
                }

                // Get messages before this stream ID - O(log n + k)
                $streamMessages = $this->client->xrevrange($keyMessages, $streamId, '-',  $limit);

            } else {
                // Get latest messages - O(log n + k)
                $streamMessages = $this->client->xrevrange($keyMessages, '+', '-',  $limit);
            }

            // Extract message data from stream entries
            $messages = [];
            foreach ($streamMessages as $entry) {
                $messages[] = json_decode($entry['data'], true);
            }

            return $messages; // Already in correct order (newest first)
        } catch (\Exception $e) {
            $this->logger->log('Redis getGroupMessagesPaginated failed: ' . $e->getMessage());
            return $this->sqlite->getGroupMessagesPaginated($groupId, $requestingUserId, $limit, $beforeMessageId);
        }
    }

    /**
     * Mark messages as read up to a specific message and reset unread count
     */
    public function markMessagesRead($groupId, $userId, $lastMessageId)
    {
        if (!$this->client) {
            return $this->sqlite->markMessagesRead($groupId, $userId, $lastMessageId);
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
            return $this->sqlite->markMessagesRead($groupId, $userId, $lastMessageId);
        }
    }
}

