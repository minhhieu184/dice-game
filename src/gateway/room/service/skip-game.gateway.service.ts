import {
  InjectRedis,
  PLAYER_TO_START,
  roomKey,
  roomLockKey,
  roomPlayerKey,
  RoomStatus,
  SocketEmitEvent,
  WSException
} from '@common'
import { LockService } from '@config/lock'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { GameGatewayService } from '@gateway/game/service'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import Redis from 'ioredis'
import { Server } from 'socket.io'
import { FreeUserGatewayService } from './free-user.gateway.service'

@Injectable()
@WebSocketGateway(socketOption)
export class SkipGameGatewayService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    protected readonly lockService: LockService,
    protected readonly baseGatewayService: BaseGatewayService,
    @Inject(forwardRef(() => GameGatewayService))
    protected readonly gameGatewayService: GameGatewayService,
    private readonly freeUserGatewayService: FreeUserGatewayService
  ) {}

  @WebSocketServer() private readonly io: Server

  async skipGame(userId: string) {
    //* Check user in room
    const isFreeSimple = await this.freeUserGatewayService.isFreeSimple(userId)
    if (isFreeSimple.isFree) throw new WSException('User not in room')
    const roomId = isFreeSimple.roomId

    //* Check player count
    const playerCount = await this.redis.playerCount(roomPlayerKey(roomId))
    if (playerCount >= PLAYER_TO_START)
      throw new WSException('Room has enough players to continue game')
    //* Check room status
    const [roomStatus, gameId] = await this.redis.hmget(
      roomKey(roomId),
      'status',
      'gameId'
    )
    if (roomStatus === RoomStatus.WAITING)
      throw new WSException('Game has not started yet')
    if (roomStatus === RoomStatus.RESULT) throw new WSException('Game has ended')
    //* Check gameId
    if (!gameId) throw new WSException('Room does not have game')

    //* Lock room
    await this.lockService.acquire(roomLockKey(roomId), async (done) => {
      //* Check current gameId
      const currentGameId = await this.redis.hget(roomKey(roomId), 'gameId')
      if (currentGameId !== gameId) return done()

      await this.gameGatewayService.clearRoomTimer(roomId)
      await this.gameGatewayService.resetRoomData(roomId)
      await this.baseGatewayService.emitRoomData(roomId, SocketEmitEvent.SKIP_GAME)
      done()
      await this.gameGatewayService.newGame(roomId)
    })
  }
}
