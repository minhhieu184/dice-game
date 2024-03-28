import {
  InjectRedis,
  newGameLockKey,
  roomKey,
  roomLockKey,
  roomName,
  roomPlayerKey,
  RoomStatus,
  SocketEmitEvent,
  userKey,
  userRoomName,
  WSException
} from '@common'
import { EnvironmentService } from '@config/environment'
import { LockService } from '@config/lock'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { GameGatewayService, ResultWaiting } from '@gateway/game/service'
import { RoomService } from '@model/room/room.service'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import Redis from 'ioredis'
import { Server } from 'socket.io'

@Injectable()
@WebSocketGateway(socketOption)
export class LeaveRoomGatewayService extends ResultWaiting {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly lockService: LockService,
    private readonly baseGatewayService: BaseGatewayService,
    @Inject(forwardRef(() => GameGatewayService))
    protected readonly gameGatewayService: GameGatewayService,
    private readonly roomService: RoomService,
    private readonly environmentService: EnvironmentService
  ) {
    super()
  }

  @WebSocketServer() private readonly io: Server

  async leaveRoom(userId: string, reason?: string) {
    const [roomId] = await this._preCheck(userId)

    await this.lockService.acquire(roomLockKey(roomId), async (done) => {
      //* Clear player data, leave sockets
      const { isRestartGame } = await this.clearPlayerLeaveRoom(userId, reason)
      //* Expire room if no player
      const playerInRoom = await this.redis.hlen(roomPlayerKey(roomId))
      if (playerInRoom === 0) {
        const expiredAt = new Date(
          Date.now() + this.environmentService.get('ROOM_EXPIRE_MILLISECONDS')
        )
        const unixTimeSeconds = Math.ceil(expiredAt.getTime() / 1000)
        await this.redis.expireat(roomKey(roomId), unixTimeSeconds)
        await this.roomService.update(roomId, { expiredAt })
      }
      //* Stop game or start new game
      const playerInGame = await this.redis.playerCount(roomPlayerKey(roomId))

      if (playerInGame < 2 || isRestartGame) {
        await this.gameGatewayService.clearRoomTimer(roomId)
        await this.gameGatewayService.resetRoomData(roomId)
        done()
        const isNewGameLock = this.lockService.isBusy(newGameLockKey(roomId))
        if (isNewGameLock) return
        if (isRestartGame) {
          const waitingTime = this.waitingTime(0)
          await new Promise((resolve) => setTimeout(resolve, waitingTime))
        }
        await this.gameGatewayService.newGame(roomId)
      } else done()
    })
  }

  async clearPlayerLeaveRoom(userId: string, reason?: string) {
    const [roomId, seat] = await this._preCheck(userId)

    const [currentHostId, timer, roomStatus] = await this.redis.hmget(
      roomKey(roomId),
      'host',
      'autoPlayBetTimer',
      'status'
    )
    const isHost = currentHostId === userId
    let newHostId: string | null = null
    if (isHost) newHostId = await this.redis.nextHost(roomId)

    //* All player's sockets leave room
    this.io.to(userRoomName(userId)).socketsLeave(roomName(roomId))
    //* Clear player autoplay
    if (timer) clearTimeout(timer)
    //* Update user redis data
    const updateUserReq = this.redis.multi()
    updateUserReq.hset(userKey(userId), {
      roomId: '',
      seat: 0,
      defaultBet: -1,
      balance: -1,
      totalBet: -1,
      totalBetSimple: -1,
      isAutoPlay: false,
      autoPlayBet: 0,
      autoPlayBetInPercent: 0,
      autoPlayHostBet: 0,
      autoPlayHostBetInPercent: 0
    })
    updateUserReq.hdel(userKey(userId), 'isPending')
    updateUserReq.hdel(userKey(userId), 'disconnectTimer')
    updateUserReq.hdel(roomPlayerKey(roomId), seat)
    await updateUserReq.exec()

    //* Update room player count
    const playerCount = await this.redis.hlen(roomPlayerKey(roomId))
    this.roomService.update(roomId, { current_player_in_room: playerCount })
    //* Notify other players
    const userInfo = await this.redis.hgetall(userKey(userId))
    const roomInfo = await this.baseGatewayService.roomResponseData(roomId)
    const isHostQuit = isHost && !!newHostId
    const isRestartGame = isHostQuit && roomStatus !== RoomStatus.WAITING
    this.io
      .to(roomName(roomId))
      .to(userRoomName(userId))
      .emit(SocketEmitEvent.PLAYER_LEAVE_ROOM, {
        room: roomInfo,
        leavePlayer: userInfo,
        isHostQuit,
        reason
      })
    return { isRestartGame }
  }

  private async _preCheck(userId: string) {
    const [roomId, seat] = await this.redis.hmget(userKey(userId), 'roomId', 'seat')
    if (!roomId || !seat) throw new WSException('User is not in any room')
    return [roomId, seat]
  }
}
