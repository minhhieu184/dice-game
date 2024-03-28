import { RoomRedis, UserRedis } from '@common'

export type RoomResponseData = RoomRedis & { players: UserRedis[] }
