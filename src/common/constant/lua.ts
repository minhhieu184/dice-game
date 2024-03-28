import { Callback, CommonRedisOptions, Result } from 'ioredis'

export const luaScripts = {
  setSeat: {
    numberOfKeys: 1,
    lua: `
      local roomPlayerKey = KEYS[1]
      local userId = ARGV[1]
      for i = 1, 10 do
        local result = redis.call("HSETNX", roomPlayerKey, i, userId)
        if result == 1 then return i end
      end
      return nil
    `
  },
  nextHost: {
    numberOfKeys: 0,
    lua: `
      local roomId = ARGV[1]

      -- Generate keys utils
      local function roomKey(_id) return "room:" .. _id end
      local function userKey(_id) return "user:" .. _id end
      local function roomPlayerKey(_id) return roomKey(_id) .. ":player" end

      local function nextHost(roomId)
        -- Get current host seat
        local hostId = redis.call("HGET", roomKey(roomId), "host")
        if not hostId then return nil end
        local _curHostSeat = redis.call("HGET", userKey(hostId), "seat")
        if not _curHostSeat then return nil end
        local curHostSeat = tonumber(_curHostSeat)

        -- Get next host
        if curHostSeat < 10 then
          for i = curHostSeat + 1, 10 do
            local userId = redis.call("HGET", roomPlayerKey(roomId), i)
            if userId then return userId end
          end
        end
        if curHostSeat > 1 then
          for i = 1, curHostSeat - 1 do
            local userId = redis.call("HGET", roomPlayerKey(roomId), i)
            if userId then return userId end
          end
        end
        return nil
      end

      local nextHostId = nextHost(roomId)
      if nextHostId then redis.call("HSET", roomKey(roomId), "host", nextHostId)
      else redis.call("HSET", roomKey(roomId), "host", "")
      end
      
      return nextHostId
    `
  },
  playerCount: {
    numberOfKeys: 1,
    lua: `
      local roomPlayerKey = KEYS[1]
      local players = redis.call("HVALS", roomPlayerKey)
      local count = 0
      -- For loop all values in players
      for _, player in pairs(players) do
        local isPending = redis.call("HGET", "user:" .. player, "isPending")
        if not isPending then count = count + 1 end
      end
      return count
    `
  }
} satisfies NonNullable<CommonRedisOptions['scripts']>

// Add declarations
declare module 'ioredis' {
  interface RedisCommander<Context> {
    setSeat(
      roomPlayerKey: string,
      userId: string,
      callback?: Callback<number | null>
    ): Result<number | null, Context>
    nextHost(
      roomId: string,
      callback?: Callback<string | null>
    ): Result<string | null, Context>
    /** Count playing players */
    playerCount(
      roomPlayerKey: string,
      callback?: Callback<string | null>
    ): Result<number, Context>
  }
}
