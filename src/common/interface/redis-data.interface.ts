import { RoomStatus } from '@common/constant'

/** User */
export interface CreateUserRedis {
  _id: string
  roomId: string
  seat: number
  defaultBet: number
  decide: boolean
  name: string
  createdAt: string
  balance: number
  totalBet: number
  totalBetSimple: number
  isAutoPlay: boolean
  autoPlayBet: number
  autoPlayBetInPercent: number
  autoPlayHostBet: number
  autoPlayHostBetInPercent: number
  isPending?: any
  disconnectTimer?: NodeJS.Timer
}

export type UserRedis = {
  [K in keyof CreateUserRedis]: string
}

export type UpdateUserRedis = Partial<Omit<CreateUserRedis, '_id'>>

/** Room */
export interface CreateRoomRedis {
  _id: string
  name: string
  tokenId: string
  minBet: number
  countdown: number
  creatorId: string
  host: string
  bet?: number
  status: RoomStatus
  gameId?: string
  betTimer?: NodeJS.Timer
  autoPlayBetTimer?: NodeJS.Timer
  decideTimer?: NodeJS.Timer
  password?: string
}

export type RoomRedis = {
  [K in keyof Required<CreateRoomRedis>]: string
}

export type UpdateRoomRedis = Partial<Omit<CreateRoomRedis, '_id'>>

/** Auto play */
export interface CreateAutoPlayRedis {
  bet: number
  betInPercent: number
  hostBet: number
  hostBetInPercent: number
}
