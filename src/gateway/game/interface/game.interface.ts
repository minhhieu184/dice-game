import { Socket } from '@common'

// export interface StartGameArgs {
//   roomId: string
//   host: string
// }
export interface SetBetArgs {
  userId: string
  bet: number
}
export interface SetBetSuccessHandleArgs {
  roomId: string
  gameId: string
  hostId: string
  bet: number
}
export interface PlayerDecideArgs {
  client: Socket
  roomId: string
  decide: boolean
}
export interface CountdownArgs {
  event: string
  roomId: string
  seconds: number
  endCallback?: () => Promise<void>
}
export interface StatisticResult {
  point: number
  // multiplier: number
  loserNumber: number
  winnerNumber: number
  winners: Record<string, boolean>
  // losers: Record<string, boolean>
}
