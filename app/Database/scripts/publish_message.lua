-- publish_message.lua
-- Keys:
-- KEYS[1] = group:{groupId}:messages (stream)
-- KEYS[2] = group:{groupId}:meta (hash)
-- KEYS[3] = group:{groupId}:unread (hash)
-- KEYS[4] = group:{groupId}:msg_to_stream (hash)
-- ARGV:
-- 1 = message_json
-- 2 = last_message_ts
-- 3 = last_message_summary
-- 4 = group_id
-- 5 = message_id
-- 6... = member ids

local message = ARGV[1]
local ts = ARGV[2]
local summary = ARGV[3]
local groupId = ARGV[4]
local messageId = ARGV[5]

-- Add message to stream and get stream ID
local streamId = redis.call('XADD', KEYS[1], '*', 'data', message)

-- Store mapping from message_id to stream_id
redis.call('HSET', KEYS[4], messageId, streamId)

-- Update meta information
redis.call('HSET', KEYS[2], 'last_message_id', messageId, 'last_message_ts', ts, 'last_message_summary', summary)

-- Update unread counts and user group activity
for i = 6, #ARGV do
  local member = ARGV[i]
  redis.call('HINCRBY', KEYS[3], member, 1)
  redis.call('ZADD', 'user:' .. member .. ':groups', ts, groupId)
end

return streamId
