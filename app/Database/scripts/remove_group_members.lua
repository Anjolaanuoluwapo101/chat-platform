-- remove_group_members.lua
-- Keys:
-- KEYS[1] = group:{groupId}:members (hash)
-- ARGV:
-- 1 = group_id

local groupId = ARGV[1]
local members = redis.call('HGETALL', KEYS[1])

-- Iterate through all members and remove the group from their user:groups sorted sets
for i = 1, #members, 2 do
  local userId = members[i]
  local userGroupsKey = 'user:' .. userId .. ':groups'
  redis.call('ZREM', userGroupsKey, groupId)
end

return #members / 2  -- Return the number of members processed